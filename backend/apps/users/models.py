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
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


# ==============================================================================
# GESTOR Y MODELO DE USUARIO PERSONALIZADO
# ==============================================================================

class CustomUserManager(BaseUserManager):
    """
    Manager personalizado donde el email es el identificador único 
    para la autenticación en lugar del nombre de usuario.
    """
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
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser debe tener is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser debe tener is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        DRIVER = 'driver', _('Conductor')
        ADMIN = 'admin', _('Administrador')

    username = None
    email = models.EmailField(_('Correo electrónico'), unique=True, db_index=True)
    first_name = models.CharField(_('Nombre'), max_length=150)
    last_name = models.CharField(_('Apellido'), max_length=150)
    role = models.CharField(
        _('Rol de usuario'),
        max_length=20,
        choices=Role.choices,
        default=Role.DRIVER,
        db_index=True,
    )
    phone = models.CharField(_('Teléfono'), max_length=30, blank=True, default='')
    avatar_url = models.URLField(_('URL del Avatar'), blank=True, default='')
    created_at = models.DateTimeField(_('Fecha de registro'), auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('Usuario')
        verbose_name_plural = _('Usuarios')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.get_role_display()}"

    @property
    def is_admin_role(self) -> bool:
        return self.role == self.Role.ADMIN or self.is_superuser


# ==============================================================================
# MODELOS DE DOMINIO (ESTACIONAMIENTOS, ESPACIOS, RESERVAS Y RESEÑAS)
# ==============================================================================

class Estacionamiento(models.Model):
    nombre = models.CharField(_('Nombre'), max_length=150)
    direccion = models.CharField(_('Dirección'), max_length=255)
    latitud = models.DecimalField(_('Latitud'), max_digits=9, decimal_places=6)
    longitud = models.DecimalField(_('Longitud'), max_digits=9, decimal_places=6)
    precio_por_hora = models.DecimalField(_('Precio por Hora'), max_digits=10, decimal_places=2)
    activo = models.BooleanField(_('Activo'), default=True)
    plan_destacado = models.BooleanField(_('Plan Destacado'), default=False)
    created_at = models.DateTimeField(_('Fecha de Creación'), auto_now_add=True)

    class Meta:
        verbose_name = _('Estacionamiento')
        verbose_name_plural = _('Estacionamientos')
        ordering = ['-plan_destacado', 'nombre']

    def __str__(self):
        return f"{self.nombre} - ${self.precio_por_hora}/h"


class EspacioEstacionamiento(models.Model):
    class Estado(models.TextChoices):
        LIBRE = 'LIBRE', _('Libre')
        RESERVADO = 'RESERVADO', _('Reservado')
        FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO', _('Fuera de Servicio')

    estacionamiento = models.ForeignKey(
        Estacionamiento,
        on_delete=models.CASCADE,
        related_name='espacios',
        verbose_name=_('Estacionamiento')
    )
    codigo = models.CharField(_('Código de Espacio'), max_length=20)
    estado = models.CharField(
        _('Estado'),
        max_length=20,
        choices=Estado.choices,
        default=Estado.LIBRE,
        db_index=True
    )

    class Meta:
        verbose_name = _('Espacio de Estacionamiento')
        verbose_name_plural = _('Espacios de Estacionamiento')
        unique_together = ('estacionamiento', 'codigo')

    def __str__(self):
        return f"{self.estacionamiento.nombre} - Espacio {self.codigo} ({self.get_estado_display()})"


class Reserva(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', _('Pendiente')
        CONFIRMADA = 'CONFIRMADA', _('Confirmada')
        EN_CURSO = 'EN_CURSO', _('En Curso')
        FINALIZADA = 'FINALIZADA', _('Finalizada')
        CANCELADA = 'CANCELADA', _('Cancelada')

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name=_('Usuario')
    )
    espacio = models.ForeignKey(
        EspacioEstacionamiento,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name=_('Espacio')
    )
    fecha_inicio = models.DateTimeField(_('Fecha de Inicio'))
    fecha_fin = models.DateTimeField(_('Fecha de Fin'))
    precio_total = models.DecimalField(_('Precio Total'), max_digits=10, decimal_places=2)
    estado = models.CharField(
        _('Estado'),
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
        db_index=True
    )
    created_at = models.DateTimeField(_('Fecha de Creación'), auto_now_add=True)

    class Meta:
        verbose_name = _('Reserva')
        verbose_name_plural = _('Reservas')
        ordering = ['-created_at']

    def __str__(self):
        return f"Reserva #{self.id} - {self.usuario.email} ({self.get_estado_display()})"


class Resena(models.Model):
    reserva = models.OneToOneField(
        Reserva,
        on_delete=models.CASCADE,
        related_name='resena',
        verbose_name=_('Reserva')
    )
    puntuacion = models.IntegerField(
        _('Puntuación'),
        validators=[
            MinValueValidator(1, message=_('La puntuación mínima es 1.')),
            MaxValueValidator(5, message=_('La puntuación máxima es 5.'))
        ]
    )
    comentario = models.TextField(_('Comentario'), blank=True, default='')
    created_at = models.DateTimeField(_('Fecha de Creación'), auto_now_add=True)

    class Meta:
        verbose_name = _('Reseña')
        verbose_name_plural = _('Reseñas')
        ordering = ['-created_at']

    def __str__(self):
        return f"Reseña #{self.id} (Puntuación: {self.puntuacion}/5)"