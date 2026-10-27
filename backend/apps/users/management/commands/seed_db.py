import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import (
    PlanSuscripcion, Servicio, Estacionamiento, EspacioEstacionamiento, EstacionamientoServicio
)

User = get_user_model()

class Command(BaseCommand):
    help = "Poblar la base de datos local con datos iniciales de prueba (Cocheras, Usuarios, Planes y Espacios)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("🌱 Iniciando seed de base de datos para PARKIA..."))

        # 1. Planes de suscripción B2B
        plan_basico, _ = PlanSuscripcion.objects.get_or_create(
            nivel=PlanSuscripcion.Nivel.BASICO,
            defaults={
                'precio_mensual': 15000.00,
                'destacado_listado': False,
                'estadisticas': False,
                'descripcion': 'Plan inicial para cocheras independientes con presencia digital.'
            }
        )
        plan_premium, _ = PlanSuscripcion.objects.get_or_create(
            nivel=PlanSuscripcion.Nivel.PREMIUM,
            defaults={
                'precio_mensual': 35000.00,
                'destacado_listado': True,
                'estadisticas': True,
                'descripcion': 'Plan destacado #1 en búsquedas, métricas avanzadas y soporte prioritario.'
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ Planes B2B configurados (Básico y Premium)."))

        # 2. Servicios
        servicios_nombres = [
            "Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Lavadero", "Acceso con QR"
        ]
        servicios_objs = {}
        for s_nom in servicios_nombres:
            s_obj, _ = Servicio.objects.get_or_create(nombre=s_nom)
            servicios_objs[s_nom] = s_obj
        self.stdout.write(self.style.SUCCESS("✓ Servicios y amenidades creados."))

        # 3. Usuarios de prueba
        admin_user = User.objects.filter(email='admin@parkia.com').first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                email='admin@parkia.com',
                password='password123',
                first_name='Admin',
                last_name='Parkia',
                phone='+54 9 11 5555-0199',
                dni='30111222'
            )
            self.stdout.write(self.style.SUCCESS("✓ Superusuario creado: admin@parkia.com (pass: password123)"))
        else:
            admin_user.set_password('password123')
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()

        driver_user = User.objects.filter(email='conductor@parkia.com').first()
        if not driver_user:
            driver_user = User.objects.create_user(
                email='conductor@parkia.com',
                password='password123',
                first_name='Carlos',
                last_name='Conductor',
                role=User.Role.DRIVER,
                phone='+54 9 11 5555-0100',
                dni='35888999',
                es_parkia_pass=True
            )
            self.stdout.write(self.style.SUCCESS("✓ Conductor demo creado: conductor@parkia.com (pass: password123)"))
        else:
            driver_user.set_password('password123')
            driver_user.save()

        # 4. Estacionamientos de CABA
        estacionamientos_data = [
            {
                'id': 1,
                'nombre': 'Estacionamiento Central Obelisco',
                'direccion': 'Av. Corrientes 1050, CABA',
                'latitud': -34.603722,
                'longitud': -58.381592,
                'precio_por_hora': 2500.00,
                'capacidad_total': 30,
                'horario_apertura': '07:00',
                'horario_cierre': '23:00',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Lavadero"]
            },
            {
                'id': 2,
                'nombre': 'Parking Plaza de Mayo',
                'direccion': 'Hipólito Yrigoyen 450, CABA',
                'latitud': -34.608300,
                'longitud': -58.371200,
                'precio_por_hora': 3200.00,
                'capacidad_total': 25,
                'horario_apertura': '08:00',
                'horario_cierre': '20:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago"]
            },
            {
                'id': 3,
                'nombre': 'Garage Puerto Madero Dique 3',
                'direccion': 'Juana Manso 1100, CABA',
                'latitud': -34.606200,
                'longitud': -58.363500,
                'precio_por_hora': 4500.00,
                'capacidad_total': 40,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica"]
            },
            {
                'id': 4,
                'nombre': 'Parkia Recoleta Mall',
                'direccion': 'Vicente López 2050, CABA',
                'latitud': -34.588000,
                'longitud': -58.393000,
                'precio_por_hora': 3800.00,
                'capacidad_total': 20,
                'horario_apertura': '08:00',
                'horario_cierre': '22:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 5,
                'nombre': 'Cocheras Palermo Soho',
                'direccion': 'Honduras 4800, CABA',
                'latitud': -34.589100,
                'longitud': -58.428900,
                'precio_por_hora': 3000.00,
                'capacidad_total': 20,
                'horario_apertura': '09:00',
                'horario_cierre': '21:00',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Lavadero"]
            }
        ]

        for ed in estacionamientos_data:
            servs = ed.pop('servicios')
            est, created = Estacionamiento.objects.update_or_create(
                id=ed['id'],
                defaults=ed
            )
            # Vincular servicios M2M
            for s_nom in servs:
                s_obj = servicios_objs.get(s_nom)
                if s_obj:
                    EstacionamientoServicio.objects.get_or_create(
                        estacionamiento=est,
                        servicio=s_obj
                    )

            # 5. Generar espacios de estacionamiento
            cap = est.capacidad_total or 20
            existentes = EspacioEstacionamiento.objects.filter(estacionamiento=est).count()
            if existentes < cap:
                for i in range(existentes + 1, cap + 1):
                    # Asignar un tercio como reservado para simular ocupación realista
                    estado = EspacioEstacionamiento.Estado.RESERVADO if (i % 3 == 0) else EspacioEstacionamiento.Estado.LIBRE
                    EspacioEstacionamiento.objects.get_or_create(
                        estacionamiento=est,
                        codigo=f"A{i:02d}",
                        defaults={'estado': estado}
                    )

        self.stdout.write(self.style.SUCCESS("✓ 5 Estacionamientos verificados en CABA y 135 plazas creadas con éxito."))
        self.stdout.write(self.style.SUCCESS("🎉 Base de datos lista para pruebas y desarrollo."))
