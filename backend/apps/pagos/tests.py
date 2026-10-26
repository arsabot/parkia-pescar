from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from apps.users.models import User, Estacionamiento, EspacioEstacionamiento, Reserva, Pago

class PagosMercadoPagoTests(APITestCase):

    def setUp(self):
        self.usuario = User.objects.create_user(
            email="test.conductor@parkia.com",
            password="Password123!",
            role=User.Role.DRIVER
        )
        self.estacionamiento = Estacionamiento.objects.create(
            nombre="Parking Test",
            direccion="Av. Corrientes 500, CABA",
            latitud=Decimal("-34.603700"),
            longitud=Decimal("-58.381600"),
            precio_por_hora=Decimal("2000.00"),
            capacidad_total=10,
            activo=True
        )
        self.espacio = EspacioEstacionamiento.objects.create(
            estacionamiento=self.estacionamiento,
            codigo="T-01",
            estado=EspacioEstacionamiento.Estado.LIBRE
        )
        self.fecha_inicio = timezone.now() + timedelta(hours=1)
        self.fecha_fin = timezone.now() + timedelta(hours=3)

    def test_crear_reserva_api(self):
        url = "/api/reservas/"
        payload = {
            "estacionamiento_id": self.estacionamiento.id,
            "fecha_inicio": self.fecha_inicio.isoformat(),
            "fecha_fin": self.fecha_fin.isoformat(),
            "usuario_email": self.usuario.email
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", res.data)
        self.assertEqual(res.data["estado"], Reserva.Estado.PENDIENTE)
        self.assertGreater(float(res.data["precio_total"]), 0)

    def test_crear_preferencia_mercadopago_y_confirmar(self):
        reserva = Reserva.objects.create(
            usuario=self.usuario,
            estacionamiento=self.estacionamiento,
            espacio=self.espacio,
            fecha_inicio=self.fecha_inicio,
            fecha_fin=self.fecha_fin,
            precio_total=Decimal("4000.00"),
            estado=Reserva.Estado.PENDIENTE
        )
        
        # 1. Crear preferencia Mercado Pago
        url_pref = "/api/pagos/crear-preferencia/"
        res_pref = self.client.post(url_pref, {"reserva_id": reserva.id}, format="json")
        self.assertEqual(res_pref.status_code, status.HTTP_201_CREATED)
        self.assertIn("preference_id", res_pref.data)
        self.assertIn("init_point", res_pref.data)
        self.assertIn("qr_payload", res_pref.data)
        pago_id = res_pref.data["pago_id"]

        # 2. Confirmar pago
        url_conf = "/api/pagos/confirmar/"
        res_conf = self.client.post(url_conf, {"pago_id": pago_id, "referencia_pago": "MP-APROBADO-1234"}, format="json")
        self.assertEqual(res_conf.status_code, status.HTTP_200_OK)
        
        # 3. Verificar estado en base de datos
        pago = Pago.objects.get(id=pago_id)
        self.assertEqual(pago.estado, Pago.Estado.APROBADO)
        reserva.refresh_from_db()
        self.assertEqual(reserva.estado, Reserva.Estado.CONFIRMADA)
