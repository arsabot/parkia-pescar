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
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from .models import Estacionamiento, EspacioEstacionamiento, Reserva, Resena


# ----------------------------------------------------------------------
# Excepciones propias de negocio (para que la API pueda traducirlas
# a códigos HTTP claros: 400, 404, 409, etc.)
# ----------------------------------------------------------------------

class EspacioNoDisponibleError(Exception):
    """Se lanza cuando se intenta reservar un espacio que ya está ocupado."""
    pass


class ReservaInvalidaError(Exception):
    """Se lanza cuando las fechas u otros datos de la reserva no son válidos."""
    pass


class ReservaNoCancelableError(Exception):
    """Se lanza cuando se intenta cancelar una reserva que ya está en curso o finalizada."""
    pass


# ----------------------------------------------------------------------
# Disponibilidad
# ----------------------------------------------------------------------

def verificar_disponibilidad(espacio: EspacioEstacionamiento, fecha_inicio, fecha_fin) -> bool:
    """
    Verifica que un espacio esté libre para la franja horaria solicitada.
    Revisa que no exista otra reserva activa (pendiente/confirmada/en curso)
    que se superponga con el rango pedido.
    """
    if fecha_inicio >= fecha_fin:
        raise ReservaInvalidaError("La fecha de inicio debe ser anterior a la de fin.")

    if fecha_inicio < timezone.now():
        raise ReservaInvalidaError("No se puede reservar en una fecha pasada.")

    estados_activos = [
        Reserva.Estado.PENDIENTE,
        Reserva.Estado.CONFIRMADA,
        Reserva.Estado.EN_CURSO,
    ]

    superposiciones = Reserva.objects.filter(
        espacio=espacio,
        estado__in=estados_activos,
        fecha_inicio__lt=fecha_fin,
        fecha_fin__gt=fecha_inicio,
    )

    return not superposiciones.exists()


# ----------------------------------------------------------------------
# Cálculo de precio
# ----------------------------------------------------------------------

def calcular_precio(espacio: EspacioEstacionamiento, fecha_inicio, fecha_fin) -> Decimal:
    """
    Calcula el precio total de una reserva según la cantidad de horas
    (redondeando siempre hacia arriba la fracción de hora) y el precio
    por hora definido en el estacionamiento.
    """
    duracion_segundos = (fecha_fin - fecha_inicio).total_seconds()
    horas = duracion_segundos / 3600

    # Redondeo hacia arriba: 1.2 horas se cobra como 2 horas.
    horas_a_cobrar = int(horas) + (1 if horas % 1 > 0 else 0)
    horas_a_cobrar = max(horas_a_cobrar, 1)  # mínimo 1 hora

    precio_hora = espacio.estacionamiento.precio_por_hora
    return Decimal(horas_a_cobrar) * precio_hora


# ----------------------------------------------------------------------
# Crear reserva
# ----------------------------------------------------------------------

@transaction.atomic
def crear_reserva(usuario, espacio_id: int, fecha_inicio, fecha_fin) -> Reserva:
    """
    Crea una reserva de forma atómica: si algo falla en el medio
    (por ejemplo, el espacio deja de estar disponible), se hace
    ROLLBACK y no queda ningún dato a medio guardar.

    select_for_update() bloquea la fila del espacio mientras dura la
    transacción, evitando que dos usuarios reserven el mismo espacio
    al mismo tiempo (condición de carrera).
    """
    try:
        espacio = EspacioEstacionamiento.objects.select_for_update().get(id=espacio_id)
    except EspacioEstacionamiento.DoesNotExist:
        raise ReservaInvalidaError("El espacio solicitado no existe.")

    if espacio.estado == EspacioEstacionamiento.Estado.FUERA_DE_SERVICIO:
        raise EspacioNoDisponibleError("Este espacio no está disponible actualmente.")

    if not verificar_disponibilidad(espacio, fecha_inicio, fecha_fin):
        raise EspacioNoDisponibleError("El espacio ya está reservado en ese horario.")

    precio_total = calcular_precio(espacio, fecha_inicio, fecha_fin)

    reserva = Reserva.objects.create(
        usuario=usuario,
        espacio=espacio,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        precio_total=precio_total,
        estado=Reserva.Estado.PENDIENTE,
    )

    # Si la reserva empieza ahora mismo, marcamos el espacio como reservado.
    espacio.estado = EspacioEstacionamiento.Estado.RESERVADO
    espacio.save(update_fields=["estado"])

    return reserva


# ----------------------------------------------------------------------
# Confirmar reserva (por ejemplo, tras confirmarse el pago)
# ----------------------------------------------------------------------

@transaction.atomic
def confirmar_reserva(reserva: Reserva) -> Reserva:
    if reserva.estado != Reserva.Estado.PENDIENTE:
        raise ReservaInvalidaError("Solo se pueden confirmar reservas pendientes.")

    reserva.estado = Reserva.Estado.CONFIRMADA
    reserva.save(update_fields=["estado"])
    return reserva


# ----------------------------------------------------------------------
# Cancelar reserva
# ----------------------------------------------------------------------

@transaction.atomic
def cancelar_reserva(reserva: Reserva) -> Reserva:
    """
    Cancela una reserva y libera el espacio asociado.
    Solo se puede cancelar si todavía no empezó (PENDIENTE o CONFIRMADA).
    """
    estados_cancelables = [Reserva.Estado.PENDIENTE, Reserva.Estado.CONFIRMADA]

    if reserva.estado not in estados_cancelables:
        raise ReservaNoCancelableError(
            "Solo se pueden cancelar reservas pendientes o confirmadas."
        )

    reserva.estado = Reserva.Estado.CANCELADA
    reserva.save(update_fields=["estado"])

    espacio = reserva.espacio
    espacio.estado = EspacioEstacionamiento.Estado.LIBRE
    espacio.save(update_fields=["estado"])

    return reserva


# ----------------------------------------------------------------------
# Finalizar reserva (el conductor se retiró del estacionamiento)
# ----------------------------------------------------------------------

@transaction.atomic
def finalizar_reserva(reserva: Reserva) -> Reserva:
    if reserva.estado != Reserva.Estado.EN_CURSO:
        raise ReservaInvalidaError("Solo se pueden finalizar reservas en curso.")

    reserva.estado = Reserva.Estado.FINALIZADA
    reserva.save(update_fields=["estado"])

    espacio = reserva.espacio
    espacio.estado = EspacioEstacionamiento.Estado.LIBRE
    espacio.save(update_fields=["estado"])

    return reserva


# ----------------------------------------------------------------------
# Reseñas: solo se pueden dejar sobre reservas finalizadas
# ----------------------------------------------------------------------

def crear_resena(reserva: Reserva, puntuacion: int, comentario: str = "") -> Resena:
    if reserva.estado != Reserva.Estado.FINALIZADA:
        raise ValidationError(
            "Solo se puede dejar una reseña sobre una reserva finalizada."
        )

    if hasattr(reserva, "resena"):
        raise ValidationError("Esta reserva ya tiene una reseña asociada.")

    return Resena.objects.create(
        reserva=reserva, puntuacion=puntuacion, comentario=comentario
    )


# ----------------------------------------------------------------------
# Búsqueda de estacionamientos cercanos (versión simple, sin PostGIS)
# ----------------------------------------------------------------------

def buscar_estacionamientos_cercanos(latitud: float, longitud: float, radio_km: float = 2.0):
    """
    Versión simplificada de búsqueda geoespacial usando la fórmula de
    Haversine en Python puro. Para producción, esto se reemplazaría por
    una consulta con PostGIS (ST_DWithin), mucho más eficiente a escala,
    pero esta versión alcanza perfecto para el MVP académico.

    Ordena los resultados priorizando primero los que tienen plan
    destacado (premium), y luego por cercanía.
    """
    from math import radians, sin, cos, sqrt, atan2

    def distancia_km(lat1, lon1, lat2, lon2):
        R = 6371  # radio de la Tierra en km
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
        return R * 2 * atan2(sqrt(a), sqrt(1 - a))

    resultados = []
    for est in Estacionamiento.objects.filter(activo=True):
        dist = distancia_km(latitud, longitud, float(est.latitud), float(est.longitud))
        if dist <= radio_km:
            resultados.append((est, dist))

    # Ordena: primero destacados, después por distancia ascendente
    resultados.sort(key=lambda tup: (not tup[0].plan_destacado, tup[1]))

    return [est for est, _ in resultados]