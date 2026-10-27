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
        self.stdout.write(self.style.NOTICE("🌱 Iniciando seed de base de datos para PARKIA con 25 cocheras en CABA..."))

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

        # 4. Estacionamientos de CABA y Gran Buenos Aires (25 cocheras realistas)
        estacionamientos_data = [
            {
                'id': 1,
                'nombre': 'Estacionamiento Central Obelisco',
                'direccion': 'Av. Corrientes 1050, San Nicolás, CABA',
                'latitud': -34.603722,
                'longitud': -58.381592,
                'precio_por_hora': 2500.00,
                'capacidad_total': 35,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Lavadero", "Acceso con QR"]
            },
            {
                'id': 2,
                'nombre': 'Parking Plaza de Mayo',
                'direccion': 'Hipólito Yrigoyen 450, Monserrat, CABA',
                'latitud': -34.608300,
                'longitud': -58.371200,
                'precio_por_hora': 3200.00,
                'capacidad_total': 30,
                'horario_apertura': '08:00',
                'horario_cierre': '20:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago"]
            },
            {
                'id': 3,
                'nombre': 'Garage Puerto Madero Dique 3',
                'direccion': 'Juana Manso 1100, Puerto Madero, CABA',
                'latitud': -34.606200,
                'longitud': -58.363500,
                'precio_por_hora': 4500.00,
                'capacidad_total': 50,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Acceso con QR"]
            },
            {
                'id': 4,
                'nombre': 'Parkia Recoleta Mall',
                'direccion': 'Vicente López 2050, Recoleta, CABA',
                'latitud': -34.588000,
                'longitud': -58.393000,
                'precio_por_hora': 3800.00,
                'capacidad_total': 25,
                'horario_apertura': '08:00',
                'horario_cierre': '22:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 5,
                'nombre': 'Cocheras Palermo Soho',
                'direccion': 'Honduras 4800, Palermo Soho, CABA',
                'latitud': -34.589100,
                'longitud': -58.428900,
                'precio_por_hora': 3000.00,
                'capacidad_total': 30,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Lavadero"]
            },
            {
                'id': 6,
                'nombre': 'Parking Belgrano Juramento',
                'direccion': 'Av. Cabildo 2150, Belgrano, CABA',
                'latitud': -34.562100,
                'longitud': -58.456500,
                'precio_por_hora': 2900.00,
                'capacidad_total': 40,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Acceso con QR"]
            },
            {
                'id': 7,
                'nombre': 'Garage Caballito Parque Rivadavia',
                'direccion': 'Av. Rivadavia 4950, Caballito, CABA',
                'latitud': -34.618600,
                'longitud': -58.435400,
                'precio_por_hora': 2700.00,
                'capacidad_total': 45,
                'horario_apertura': '07:00',
                'horario_cierre': '23:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 8,
                'nombre': 'Cochera San Telmo Histórico',
                'direccion': 'Defensa 850, San Telmo, CABA',
                'latitud': -34.619100,
                'longitud': -58.371500,
                'precio_por_hora': 2400.00,
                'capacidad_total': 25,
                'horario_apertura': '08:00',
                'horario_cierre': '21:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 9,
                'nombre': 'Estacionamiento Retiro Plaza San Martín',
                'direccion': 'Florida 1050, Retiro, CABA',
                'latitud': -34.595800,
                'longitud': -58.376200,
                'precio_por_hora': 3600.00,
                'capacidad_total': 50,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Acceso con QR"]
            },
            {
                'id': 10,
                'nombre': 'Garage Abasto Shopping',
                'direccion': 'Av. Corrientes 3250, Almagro, CABA',
                'latitud': -34.603400,
                'longitud': -58.411200,
                'precio_por_hora': 3100.00,
                'capacidad_total': 60,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Lavadero", "Acceso con QR"]
            },
            {
                'id': 11,
                'nombre': 'Parkia Núñez Libertador',
                'direccion': 'Av. del Libertador 7250, Núñez, CABA',
                'latitud': -34.546300,
                'longitud': -58.459800,
                'precio_por_hora': 3500.00,
                'capacidad_total': 35,
                'horario_apertura': '07:00',
                'horario_cierre': '23:00',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica"]
            },
            {
                'id': 12,
                'nombre': 'Cocheras Colegiales Lacroze',
                'direccion': 'Av. Federico Lacroze 2850, Colegiales, CABA',
                'latitud': -34.577200,
                'longitud': -58.448500,
                'precio_por_hora': 2300.00,
                'capacidad_total': 25,
                'horario_apertura': '08:00',
                'horario_cierre': '22:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago"]
            },
            {
                'id': 13,
                'nombre': 'Parking Villa Urquiza Triunvirato',
                'direccion': 'Av. Triunvirato 4550, Villa Urquiza, CABA',
                'latitud': -34.574200,
                'longitud': -58.487200,
                'precio_por_hora': 2400.00,
                'capacidad_total': 30,
                'horario_apertura': '07:00',
                'horario_cierre': '23:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 14,
                'nombre': 'Garage Villa Crespo Outlets',
                'direccion': 'Aguirre 850, Villa Crespo, CABA',
                'latitud': -34.596200,
                'longitud': -58.439400,
                'precio_por_hora': 2800.00,
                'capacidad_total': 35,
                'horario_apertura': '09:00',
                'horario_cierre': '21:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 15,
                'nombre': 'Parkia Las Cañitas Gourmet',
                'direccion': 'Báez 450, Las Cañitas, CABA',
                'latitud': -34.569800,
                'longitud': -58.434200,
                'precio_por_hora': 3700.00,
                'capacidad_total': 30,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Lavadero"]
            },
            {
                'id': 16,
                'nombre': 'Cocheras Microcentro Financiero',
                'direccion': 'San Martín 450, San Nicolás, CABA',
                'latitud': -34.604700,
                'longitud': -58.373800,
                'precio_por_hora': 4100.00,
                'capacidad_total': 55,
                'horario_apertura': '07:00',
                'horario_cierre': '21:00',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Acceso con QR"]
            },
            {
                'id': 17,
                'nombre': 'Parking Aeroparque Costanera',
                'direccion': 'Av. Costanera Rafael Obligado 2100, Palermo, CABA',
                'latitud': -34.561200,
                'longitud': -58.411500,
                'precio_por_hora': 4400.00,
                'capacidad_total': 75,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Acceso con QR"]
            },
            {
                'id': 18,
                'nombre': 'Estacionamiento Flores Centro',
                'direccion': 'Av. Rivadavia 6850, Flores, CABA',
                'latitud': -34.629200,
                'longitud': -58.463500,
                'precio_por_hora': 2200.00,
                'capacidad_total': 30,
                'horario_apertura': '08:00',
                'horario_cierre': '21:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 19,
                'nombre': 'Garage Barracas Distrito Diseño',
                'direccion': 'Av. Montes de Oca 720, Barracas, CABA',
                'latitud': -34.634200,
                'longitud': -58.379500,
                'precio_por_hora': 2100.00,
                'capacidad_total': 25,
                'horario_apertura': '07:00',
                'horario_cierre': '22:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago"]
            },
            {
                'id': 20,
                'nombre': 'Parkia Devoto Plaza Arenales',
                'direccion': 'Nueva York 3950, Villa Devoto, CABA',
                'latitud': -34.600200,
                'longitud': -58.513500,
                'precio_por_hora': 2600.00,
                'capacidad_total': 28,
                'horario_apertura': '08:00',
                'horario_cierre': '23:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 21,
                'nombre': 'Cocheras Chacarita Polo Gastronómico',
                'direccion': 'Jorge Newbery 3550, Chacarita, CABA',
                'latitud': -34.587200,
                'longitud': -58.449500,
                'precio_por_hora': 2900.00,
                'capacidad_total': 32,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Acceso con QR"]
            },
            {
                'id': 22,
                'nombre': 'Parking Parque Patricios Tech',
                'direccion': 'Los Patos 2850, Parque Patricios, CABA',
                'latitud': -34.639200,
                'longitud': -58.406500,
                'precio_por_hora': 2500.00,
                'capacidad_total': 40,
                'horario_apertura': '07:00',
                'horario_cierre': '21:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 23,
                'nombre': 'Garage Puerto Madero Dique 1',
                'direccion': 'Pierina Dealessi 1850, Puerto Madero, CABA',
                'latitud': -34.621200,
                'longitud': -58.361500,
                'precio_por_hora': 4800.00,
                'capacidad_total': 50,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Lavadero"]
            },
            {
                'id': 24,
                'nombre': 'Estacionamiento Monserrat Congreso',
                'direccion': 'Av. de Mayo 1350, Monserrat, CABA',
                'latitud': -34.609800,
                'longitud': -58.386500,
                'precio_por_hora': 2700.00,
                'capacidad_total': 35,
                'horario_apertura': '07:00',
                'horario_cierre': '23:00',
                'plan': plan_basico,
                'servicios': ["Techado", "Mercado Pago", "Seguridad 24h"]
            },
            {
                'id': 25,
                'nombre': 'Parkia Saavedra Dot Baires',
                'direccion': 'Vedia 3650, Saavedra, CABA',
                'latitud': -34.545200,
                'longitud': -58.498500,
                'precio_por_hora': 3200.00,
                'capacidad_total': 80,
                'horario_apertura': '00:00',
                'horario_cierre': '23:59',
                'plan': plan_premium,
                'servicios': ["Techado", "Seguridad 24h", "Mercado Pago", "Carga eléctrica", "Acceso con QR"]
            }
        ]

        total_plazas_creadas = 0
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
            
            total_plazas_creadas += EspacioEstacionamiento.objects.filter(estacionamiento=est).count()

        self.stdout.write(self.style.SUCCESS(f"✓ 25 Estacionamientos verificados en CABA y {total_plazas_creadas} plazas activas."))
        self.stdout.write(self.style.SUCCESS("🎉 Base de datos populada con éxito para máxima variedad y volumen visual."))
