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
