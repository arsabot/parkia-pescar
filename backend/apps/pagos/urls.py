from django.urls import path
from .views import (
    CrearPreferenciaMercadoPagoView,
    ConfirmarPagoView,
    DetallePagoView,
    MercadoPagoWebhookView,
)

urlpatterns = [
    path('crear-preferencia/', CrearPreferenciaMercadoPagoView.as_view(), name='pago-crear-preferencia'),
    path('confirmar/', ConfirmarPagoView.as_view(), name='pago-confirmar'),
    path('reserva/<int:reserva_id>/', DetallePagoView.as_view(), name='pago-detalle-reserva'),
    path('webhook/', MercadoPagoWebhookView.as_view(), name='pago-webhook-mercadopago'),
]
