"""
Parkia - Lógica de Negocio
Autor: Mijail
Framework: Django (services layer)

Este archivo centraliza las reglas de negocio del sistema: crear reservas,
calcular precios, verificar disponibilidad, cancelar reservas y habilitar
reseñas. Mantener esta lógica separada de las vistas facilita testear cada
regla de forma independiente y evita duplicar código entre distintos
endpoints de la API REST.
"""
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


# ==============================================================================
# GESTOR Y MODELO DE USUARIO
# ==============================================================================

class CustomUserManager(BaseUserManager):
    """Manager personalizado: email como identificador único en lugar de username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('El correo electrónico es obligatorio.'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser debe tener is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser debe tener is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Usuario del sistema.
    - conductor: reserva espacios de estacionamiento.
    - empleado:  gestiona un estacionamiento puntual.
    - admin:     administra toda la plataforma.

    Agrega DNI (campo único del diagrama ER) y teléfono.
    """

    class Role(models.TextChoices):
        DRIVER = 'driver', _('Conductor')
        EMPLEADO  = 'empleado',  _('Empleado')
        ADMIN     = 'admin',     _('Administrador')

    username   = None
    email      = models.EmailField(_('Correo electrónico'), unique=True, db_index=True)
    first_name = models.CharField(_('Nombre'), max_length=150)
    last_name  = models.CharField(_('Apellido'), max_length=150)
    # Campo agregado — requerido por el diagrama ER
    dni        = models.CharField(_('DNI'), max_length=20, unique=True, null=True, blank=True)
    role       = models.CharField(
        _('Rol de usuario'), max_length=20,
        choices=Role.choices, default=Role.DRIVER, db_index=True,
    )
    phone      = models.CharField(_('Teléfono'), max_length=30, blank=True, default='')
    avatar_url = models.URLField(_('URL del Avatar'), blank=True, default='')
    created_at = models.DateTimeField(_('Fecha de registro'), auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name        = _('Usuario')
        verbose_name_plural = _('Usuarios')
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) — {self.get_role_display()}"

    @property
    def is_admin_role(self) -> bool:
        return self.role == self.Role.ADMIN or self.is_superuser


# ==============================================================================
# AUTOS — nuevo, requerido por el diagrama ER
# ==============================================================================

class Auto(models.Model):
    """
    Vehículo registrado por un conductor.
    Un conductor puede tener varios autos (1 a muchos).
    """
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='autos',
        verbose_name=_('Propietario'),
    )
    patente = models.CharField(_('Patente'), max_length=20, unique=True)
    marca   = models.CharField(_('Marca'), max_length=50, blank=True, default='')
    modelo  = models.CharField(_('Modelo'), max_length=50, blank=True, default='')

    class Meta:
        verbose_name        = _('Auto')
        verbose_name_plural = _('Autos')

    def __str__(self):
        return f"{self.patente} ({self.usuario.get_full_name()})"


# ==============================================================================
# SERVICIOS — nuevo, requerido por el diagrama ER
# ==============================================================================

class Servicio(models.Model):
    """
    Característica ofrecida por un estacionamiento
    (ej: cubierto, vigilancia 24h, lavadero, carga eléctrica).
    """
    nombre = models.CharField(_('Nombre'), max_length=100, unique=True)

    class Meta:
        verbose_name        = _('Servicio')
        verbose_name_plural = _('Servicios')
        ordering            = ['nombre']

    def __str__(self):
        return self.nombre


# ==============================================================================
# PLANES DE SUSCRIPCIÓN — monetización B2B SaaS
# ==============================================================================

class PlanSuscripcion(models.Model):
    """
    Define los planes que un estacionamiento puede contratar (Básico, Premium).
    Refleja el modelo de monetización por suscripción mensual del documento.
    """

    class Nivel(models.TextChoices):
        BASICO  = 'basico',  _('Básico')
        PREMIUM = 'premium', _('Premium')

    nivel             = models.CharField(_('Nivel'), max_length=20, choices=Nivel.choices, unique=True)
    precio_mensual    = models.DecimalField(_('Precio mensual'), max_digits=10, decimal_places=2)
    destacado_listado = models.BooleanField(_('Aparece destacado en listado'), default=False)
    estadisticas      = models.BooleanField(_('Acceso a estadísticas'), default=False)
    descripcion       = models.TextField(_('Descripción'), blank=True, default='')

    class Meta:
        verbose_name        = _('Plan de Suscripción')
        verbose_name_plural = _('Planes de Suscripción')

    def __str__(self):
        return f"Plan {self.get_nivel_display()} — ${self.precio_mensual}/mes"


# ==============================================================================
# ESTACIONAMIENTOS
# ==============================================================================

class Estacionamiento(models.Model):
    """
    Estacionamiento o cochera registrado en la plataforma.

    Agrega los campos faltantes del diagrama ER:
      - capacidad_total
      - horario_apertura / horario_cierre

    Agrega vínculo al PlanSuscripcion para la monetización B2B.
    La relación con Servicio se maneja a través de EstacionamientoServicio (M2M).
    """
    nombre           = models.CharField(_('Nombre'), max_length=150)
    direccion        = models.CharField(_('Dirección'), max_length=255)
    latitud          = models.DecimalField(_('Latitud'), max_digits=9, decimal_places=6)
    longitud         = models.DecimalField(_('Longitud'), max_digits=9, decimal_places=6)
    precio_por_hora  = models.DecimalField(_('Precio por Hora'), max_digits=10, decimal_places=2)
    # Campos agregados — requeridos por el diagrama ER
    capacidad_total  = models.PositiveIntegerField(_('Capacidad Total'), default=0)
    horario_apertura = models.TimeField(_('Horario de Apertura'))
    horario_cierre   = models.TimeField(_('Horario de Cierre'))
    activo           = models.BooleanField(_('Activo'), default=True)
    # Empleado que gestiona este estacionamiento
    encargado        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='estacionamientos_a_cargo',
        verbose_name=_('Encargado'),
    )
    # Monetización B2B SaaS — plan contratado por el estacionamiento
    plan             = models.ForeignKey(
        PlanSuscripcion,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='estacionamientos',
        verbose_name=_('Plan de Suscripción'),
    )
    plan_desde       = models.DateField(_('Plan desde'), null=True, blank=True)
    plan_hasta       = models.DateField(_('Plan hasta'), null=True, blank=True)
    # Relación M2M con Servicio a través de tabla intermedia explícita
    servicios        = models.ManyToManyField(
        Servicio,
        through='EstacionamientoServicio',
        blank=True,
        verbose_name=_('Servicios'),
    )
    created_at       = models.DateTimeField(_('Fecha de Creación'), auto_now_add=True)

    class Meta:
        verbose_name        = _('Estacionamiento')
        verbose_name_plural = _('Estacionamientos')
        ordering            = ['nombre']

    def __str__(self):
        return f"{self.nombre} — ${self.precio_por_hora}/h"

    @property
    def plan_destacado(self) -> bool:
        """True si el plan activo habilita el destacado en el listado."""
        return bool(self.plan and self.plan.destacado_listado)

    @property
    def espacios_disponibles(self) -> int:
        """Cantidad de espacios libres en este momento."""
        return self.espacios.filter(estado=EspacioEstacionamiento.Estado.LIBRE).count()


# ==============================================================================
# TABLA INTERMEDIA ESTACIONAMIENTO ↔ SERVICIO
# equivale a ESTACIONAMIENTO_SERVICIOS del diagrama ER
# ==============================================================================

class EstacionamientoServicio(models.Model):
    """
    Tabla intermedia explícita entre Estacionamiento y Servicio.
    Equivale a la entidad ESTACIONAMIENTO_SERVICIOS del diagrama ER.
    """
    estacionamiento = models.ForeignKey(
        Estacionamiento, on_delete=models.CASCADE,
        verbose_name=_('Estacionamiento'),
    )
    servicio = models.ForeignKey(
        Servicio, on_delete=models.CASCADE,
        verbose_name=_('Servicio'),
    )

    class Meta:
        verbose_name        = _('Servicio del Estacionamiento')
        verbose_name_plural = _('Servicios del Estacionamiento')
        unique_together     = ('estacionamiento', 'servicio')

    def __str__(self):
        return f"{self.estacionamiento.nombre} — {self.servicio.nombre}"


# ==============================================================================
# ESPACIOS INDIVIDUALES
# ==============================================================================

class EspacioEstacionamiento(models.Model):
    """
    Espacio individual dentro de un estacionamiento.
    Permite control fino de disponibilidad, no solo un contador global.
    """

    class Estado(models.TextChoices):
        LIBRE             = 'LIBRE',             _('Libre')
        RESERVADO         = 'RESERVADO',         _('Reservado')
        FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO', _('Fuera de Servicio')

    estacionamiento = models.ForeignKey(
        Estacionamiento, on_delete=models.CASCADE,
        related_name='espacios', verbose_name=_('Estacionamiento'),
    )
    codigo = models.CharField(_('Código de Espacio'), max_length=20)
    estado = models.CharField(
        _('Estado'), max_length=20,
        choices=Estado.choices, default=Estado.LIBRE, db_index=True,
    )

    class Meta:
        verbose_name        = _('Espacio de Estacionamiento')
        verbose_name_plural = _('Espacios de Estacionamiento')
        unique_together     = ('estacionamiento', 'codigo')

    def __str__(self):
        return f"{self.estacionamiento.nombre} — Espacio {self.codigo} ({self.get_estado_display()})"


# ==============================================================================
# RESERVAS
# ==============================================================================

class Reserva(models.Model):
    """
    Reserva de un espacio por parte de un conductor para un vehículo específico.

    Cambios respecto a la versión anterior:
    - Agrega FK a Auto (requerido por el diagrama ER)
    - Agrega FK directa a Estacionamiento (requerido por el diagrama ER)
    - Agrega campos comision_pct y comision_monto (monetización por reserva)
    """

    class Estado(models.TextChoices):
        PENDIENTE  = 'PENDIENTE',  _('Pendiente')
        CONFIRMADA = 'CONFIRMADA', _('Confirmada')
        EN_CURSO   = 'EN_CURSO',   _('En Curso')
        FINALIZADA = 'FINALIZADA', _('Finalizada')
        CANCELADA  = 'CANCELADA',  _('Cancelada')

    usuario         = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='reservas', verbose_name=_('Usuario'),
    )
    # FK a Auto — nuevo, requerido por el diagrama ER
    auto            = models.ForeignKey(
        Auto, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reservas', verbose_name=_('Auto'),
    )
    # FK directa a Estacionamiento — nuevo, requerido por el diagrama ER
    estacionamiento = models.ForeignKey(
        Estacionamiento, on_delete=models.CASCADE,
        related_name='reservas', verbose_name=_('Estacionamiento'),
    )
    espacio         = models.ForeignKey(
        EspacioEstacionamiento, on_delete=models.CASCADE,
        related_name='reservas', verbose_name=_('Espacio'),
    )
    fecha_inicio    = models.DateTimeField(_('Fecha de Inicio'))
    fecha_fin       = models.DateTimeField(_('Fecha de Fin'))
    precio_total    = models.DecimalField(_('Precio Total'), max_digits=10, decimal_places=2)
    # Monetización por reserva — porcentaje y monto que la plataforma retiene
    comision_pct    = models.DecimalField(
        _('Comisión (%)'), max_digits=5, decimal_places=2, default=Decimal('5.00'),
        help_text=_('Porcentaje que la plataforma retiene de esta reserva.'),
    )
    comision_monto  = models.DecimalField(
        _('Comisión ($)'), max_digits=10, decimal_places=2, default=Decimal('0.00'),
        help_text=_('Monto calculado al confirmar la reserva.'),
    )
    estado          = models.CharField(
        _('Estado'), max_length=20,
        choices=Estado.choices, default=Estado.PENDIENTE, db_index=True,
    )
    created_at      = models.DateTimeField(_('Fecha de Creación'), auto_now_add=True)

    class Meta:
        verbose_name        = _('Reserva')
        verbose_name_plural = _('Reservas')
        ordering            = ['-created_at']

    def __str__(self):
        return f"Reserva #{self.id} — {self.usuario.email} ({self.get_estado_display()})"

    def calcular_comision(self) -> Decimal:
        """Calcula y guarda el monto de comisión según el porcentaje configurado."""
        self.comision_monto = (
            self.precio_total * self.comision_pct / Decimal('100')
        ).quantize(Decimal('0.01'))
        return self.comision_monto


# ==============================================================================
# RESEÑAS
# ==============================================================================

class Resena(models.Model):
    """
    Reseña que un conductor puede dejar sobre una reserva finalizada.
    Solo se permite una reseña por reserva (OneToOne).
    """
    reserva    = models.OneToOneField(
        Reserva, on_delete=models.CASCADE,
        related_name='resena', verbose_name=_('Reserva'),
    )
    puntuacion = models.IntegerField(
        _('Puntuación'),
        validators=[
            MinValueValidator(1, message=_('La puntuación mínima es 1.')),
            MaxValueValidator(5, message=_('La puntuación máxima es 5.')),
        ],
    )
    comentario = models.TextField(_('Comentario'), blank=True, default='')
    created_at = models.DateTimeField(_('Fecha de Creación'), auto_now_add=True)

    class Meta:
        verbose_name        = _('Reseña')
        verbose_name_plural = _('Reseñas')
        ordering            = ['-created_at']

    def __str__(self):
        return f"Reseña #{self.id} — {self.puntuacion}/5 (Reserva #{self.reserva_id})"

# ==============================================================================
# PAGOS
# ==============================================================================

class Pago(models.Model):
    """Pago asociado a una reserva."""

    class Metodo(models.TextChoices):
        BILLETERA = 'billetera_virtual', _('Billetera virtual')
        DEBITO    = 'tarjeta_debito',    _('Tarjeta de débito')
        CREDITO   = 'tarjeta_credito',   _('Tarjeta de crédito')
        EFECTIVO  = 'efectivo',          _('Efectivo en comercio')

    class Proveedor(models.TextChoices):
        MERCADO_PAGO = 'mercado_pago', _('Mercado Pago')
        MODO         = 'modo',         _('MODO')
        UALA         = 'uala',         _('Ualá')
        VISA         = 'visa',         _('Visa')
        MASTERCARD   = 'mastercard',   _('Mastercard')
        RAPIPAGO     = 'rapipago',     _('Rapipago')
        PAGO_FACIL   = 'pago_facil',   _('Pago Fácil')

    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', _('Pendiente')
        APROBADO  = 'APROBADO',  _('Aprobado')
        RECHAZADO = 'RECHAZADO', _('Rechazado')
        REEMBOLSADO = 'REEMBOLSADO', _('Reembolsado')

    reserva    = models.ForeignKey(
        Reserva, on_delete=models.CASCADE,
        related_name='pagos', verbose_name=_('Reserva'),
    )
    monto      = models.DecimalField(_('Monto'), max_digits=10, decimal_places=2)
    metodo     = models.CharField(_('Método de pago'), max_length=20, choices=Metodo.choices)
    proveedor  = models.CharField(_('Proveedor'), max_length=20, choices=Proveedor.choices)
    estado     = models.CharField(
        _('Estado'), max_length=20,
        choices=Estado.choices, default=Estado.PENDIENTE, db_index=True,
    )
    referencia_externa = models.CharField(_('Referencia externa'), max_length=100, blank=True, default='')
    fecha_pago = models.DateTimeField(_('Fecha de pago'), null=True, blank=True)
    created_at = models.DateTimeField(_('Fecha de creación'), auto_now_add=True)

    class Meta:
        verbose_name        = _('Pago')
        verbose_name_plural = _('Pagos')
        ordering            = ['-created_at']

    def __str__(self):
        return f"Pago #{self.id} — ${self.monto} ({self.get_estado_display()})"
