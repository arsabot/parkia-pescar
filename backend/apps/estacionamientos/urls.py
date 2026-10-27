from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EstacionamientoViewSet
from .reservas_views import ReservaListCreateView, ReservaDetailView, ReservaCancelarView
from .business_views import (
    ComercioCercanoListView,
    PlanesSuscripcionListView,
    ContratarPlanEstacionamientoView,
    ParkiaPassStatusView,
    ContratarParkiaPassView,
    ParkiaPassReporteGastosView,
    AnalyticsInsightsView,
)

router = DefaultRouter()
router.register("estacionamientos", EstacionamientoViewSet, basename="estacionamiento")
router.register("parkings", EstacionamientoViewSet, basename="parkings")

urlpatterns = [
    # Reservas
    path('reservas/', ReservaListCreateView.as_view(), name='reserva-list-create'),
    path('reservas/<int:pk>/', ReservaDetailView.as_view(), name='reserva-detail'),
    path('reservas/<int:pk>/cancelar/', ReservaCancelarView.as_view(), name='reserva-cancelar'),

    # Pilar 3: Publicidad Geolocalizada (Comercios Cercanos)
    path('comercios-cercanos/', ComercioCercanoListView.as_view(), name='comercios-cercanos'),

    # Pilar 2: Suscripciones B2B SaaS para Estacionamientos
    path('suscripciones/estacionamiento/planes/', PlanesSuscripcionListView.as_view(), name='suscripciones-planes'),
    path('suscripciones/estacionamiento/contratar/', ContratarPlanEstacionamientoView.as_view(), name='suscripciones-estacionamiento-contratar'),

    # Pilar 4: Freemium B2C (Parkia Pass Conductor)
    path('suscripciones/parkia-pass/', ParkiaPassStatusView.as_view(), name='parkia-pass-status'),
    path('suscripciones/parkia-pass/contratar/', ContratarParkiaPassView.as_view(), name='parkia-pass-contratar'),
    path('suscripciones/parkia-pass/reporte-gastos/', ParkiaPassReporteGastosView.as_view(), name='parkia-pass-reporte-gastos'),

    # Pilar 1, 5 y 6: Datos, Analítica y Monetización (Insights B2B)
    path('analytics/insights/', AnalyticsInsightsView.as_view(), name='analytics-insights'),
] + router.urls
