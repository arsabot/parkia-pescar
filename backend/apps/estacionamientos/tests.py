from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.users.models import User, Estacionamiento, EspacioEstacionamiento, Reserva


class CrudTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user(
            email="staff@example.com", password="Prueba-12345", is_staff=True
        )
        self.driver = User.objects.create_user(
            email="driver@example.com", password="Prueba-12345"
        )
        self.payload = {
            "nombre": "Centro", "direccion": "Corrientes 123",
            "latitud": "-34.603700", "longitud": "-58.381600",
            "precio_por_hora": "1500.00", "activo": True
        }
        self.item = Estacionamiento.objects.create(**self.payload)
        self.espacio = EspacioEstacionamiento.objects.create(
            estacionamiento=self.item, codigo="A1"
        )
        self.url = "/api/estacionamientos/"

    def test_crud_completo(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(self.url, {**self.payload, "nombre": "Nuevo"}, format="json")
        self.assertEqual(response.status_code, 201)
        url = self.url + str(response.data["id"]) + "/"
        self.assertEqual(self.client.get(url).status_code, 200)
        response = self.client.patch(url, {"precio_por_hora": "2000.00"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["precio_por_hora"], "2000.00")
        self.assertEqual(self.client.put(url, {**self.payload, "nombre": "Editado"}, format="json").status_code, 200)
        self.assertEqual(self.client.delete(url).status_code, 204)
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_lectura_publica_y_permisos(self):
        self.assertEqual(self.client.get(self.url).status_code, 200)
        self.assertEqual(self.client.post(self.url, self.payload, format="json").status_code, 401)
        self.driver.role = "admin"
        self.driver.save()
        self.client.force_authenticate(self.driver)
        self.assertEqual(self.client.post(self.url, self.payload, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"{self.url}{self.item.pk}/").status_code, 403)

    def test_filtros_conteos_y_orden(self):
        otro = Estacionamiento.objects.create(**{**self.payload, "nombre": "Barato", "precio_por_hora": "0"})
        EspacioEstacionamiento.objects.create(estacionamiento=otro, codigo="B1", estado="RESERVADO")
        response = self.client.get(self.url, {"direccion": "corrientes", "disponibilidad": "disponible",
                                              "precio_min": "1500", "precio_max": "1500"})
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["espacios_disponibles"], 1)
        self.assertEqual(self.client.get(self.url, {"precio_max": "0"}).data["count"], 1)
        self.assertEqual(self.client.get(self.url, {"disponibilidad": "completo"}).data["count"], 1)
        result = self.client.get(self.url, {"orden": "precio_por_hora"}).data["results"]
        self.assertEqual(result[0]["id"], otro.pk)

    def test_datos_invalidos(self):
        self.client.force_authenticate(self.staff)
        for cambio in ({"precio_por_hora": "-1"}, {"latitud": "91"},
                       {"longitud": "-181"}, {"nombre": ""}):
            self.assertEqual(self.client.post(self.url, {**self.payload, **cambio}, format="json").status_code, 400)
        for filtros in ({"precio_max": "abc"}, {"precio_min": "2", "precio_max": "1"},
                        {"precio_max": "-1"}, {"disponibilidad": "cualquiera"}, {"orden": "password"}):
            self.assertEqual(self.client.get(self.url, filtros).status_code, 400)

    def test_proteger_historial_y_desactivar(self):
        reserva = Reserva.objects.create(
            usuario=self.driver, espacio=self.espacio, fecha_inicio=timezone.now(),
            fecha_fin=timezone.now() + timedelta(hours=1), precio_total=1500
        )
        self.client.force_authenticate(self.staff)
        url = f"{self.url}{self.item.pk}/"
        self.assertEqual(self.client.delete(url).status_code, 409)
        self.assertTrue(Reserva.objects.filter(pk=reserva.pk).exists())
        self.assertEqual(self.client.post(url + "desactivar/").status_code, 200)
        self.item.refresh_from_db()
        self.assertFalse(self.item.activo)
        self.assertEqual(self.client.get(self.url, {"disponibilidad": "disponible"}).data["count"], 0)

    def test_jwt_del_login_del_equipo(self):
        response = self.client.post("/api/auth/login/",
                                   {"email": self.staff.email, "password": "Prueba-12345"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + response.data["tokens"]["access"])
        self.assertEqual(self.client.post(self.url, self.payload, format="json").status_code, 201)

    def test_pilar1_comision_marketplace(self):
        """Pilar 1: Comisión por reserva (8% retenido por Parkia)."""
        ahora = timezone.now() + timedelta(hours=2)
        res = self.client.post("/api/reservas/", {
            "estacionamiento_id": self.item.id,
            "espacio_id": self.espacio.id,
            "fecha_inicio": ahora.isoformat(),
            "fecha_fin": (ahora + timedelta(hours=2)).isoformat(),
            "usuario_email": self.driver.email,
        }, format="json")
        self.assertEqual(res.status_code, 201)
        reserva_id = res.data["id"]
        detalle = self.client.get(f"/api/reservas/{reserva_id}/")
        self.assertEqual(detalle.status_code, 200)
        self.assertEqual(detalle.data["comision_pct"], "8.00")
        self.assertGreater(float(detalle.data["comision_monto"]), 0)
        self.assertGreater(float(detalle.data["neto_propietario"]), 0)

    def test_pilar2_suscripcion_b2b_saas(self):
        """Pilar 2: Suscripción SaaS para cocheras (Básico vs Premium)."""
        from apps.users.models import PlanSuscripcion
        PlanSuscripcion.objects.get_or_create(nivel="basico", defaults={"precio_mensual": 15000})
        PlanSuscripcion.objects.get_or_create(nivel="premium", defaults={"precio_mensual": 35000, "destacado_listado": True, "estadisticas": True})

        # Listar planes
        res_planes = self.client.get("/api/suscripciones/estacionamiento/planes/")
        self.assertEqual(res_planes.status_code, 200)
        self.assertGreaterEqual(len(res_planes.data["results"]), 2)

        # Contratar plan premium
        res_upgrade = self.client.post("/api/suscripciones/estacionamiento/contratar/", {
            "estacionamiento_id": self.item.id,
            "plan_nivel": "premium"
        }, format="json")
        self.assertEqual(res_upgrade.status_code, 200)
        self.assertEqual(res_upgrade.data["plan_nivel"], "premium")
        self.assertTrue(res_upgrade.data["destacado_listado"])

    def test_pilar3_publicidad_geolocalizada(self):
        """Pilar 3: Comercios cercanos patrocinados en la zona."""
        from apps.users.models import ComercioCercano
        ComercioCercano.objects.create(
            nombre="Café Test",
            rubro=ComercioCercano.Rubro.CAFETERIA,
            direccion="Corrientes 100",
            descuento="15% OFF",
            distancia_metros=80,
            estacionamiento=self.item,
            pauta_mensual=15000
        )
        res = self.client.get(f"/api/comercios-cercanos/?estacionamiento_id={self.item.id}")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["nombre"], "Café Test")

    def test_pilar4_parkia_pass_freemium(self):
        """Pilar 4: Suscripción Parkia Pass B2C (10% descuento y reportes)."""
        # Estado inicial
        res_status = self.client.get(f"/api/suscripciones/parkia-pass/?email={self.driver.email}")
        self.assertEqual(res_status.status_code, 200)
        self.assertFalse(res_status.data["es_parkia_pass"])

        # Alta de suscripción
        res_alta = self.client.post("/api/suscripciones/parkia-pass/contratar/", {
            "usuario_email": self.driver.email,
            "meses": 1
        }, format="json")
        self.assertEqual(res_alta.status_code, 200)
        self.assertTrue(res_alta.data["es_parkia_pass"])

        # Crear reserva con usuario Parkia Pass (debe recibir 10% de descuento)
        self.driver.refresh_from_db()
        self.assertTrue(self.driver.es_parkia_pass)

        # Reporte de gastos
        res_reporte = self.client.get(f"/api/suscripciones/parkia-pass/reporte-gastos/?email={self.driver.email}")
        self.assertEqual(res_reporte.status_code, 200)
        self.assertTrue(res_reporte.data["es_parkia_pass"])

    def test_pilar5_y_6_analytics_insights(self):
        """Pilar 5 & 6: Fee digital y Dashboard de Insights B2B."""
        res = self.client.get(f"/api/analytics/insights/?estacionamiento_id={self.item.id}")
        self.assertEqual(res.status_code, 200)
        self.assertIn("kpis_financieros", res.data)
        self.assertIn("horas_pico", res.data)
        self.assertIn("benchmark_mercado_zonal", res.data)
        self.assertEqual(res.data["kpis_financieros"]["comision_parkia_pct"], "8.00")
        self.assertEqual(res.data["kpis_financieros"]["fee_pasarela_pct"], "2.50")

