from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EstacionamientoViewSet
from .reservas_views import ReservaListCreateView, ReservaDetailView, ReservaCancelarView

router = DefaultRouter()
router.register("estacionamientos", EstacionamientoViewSet, basename="estacionamiento")

urlpatterns = [
    path('reservas/', ReservaListCreateView.as_view(), name='reserva-list-create'),
    path('reservas/<int:pk>/', ReservaDetailView.as_view(), name='reserva-detail'),
    path('reservas/<int:pk>/cancelar/', ReservaCancelarView.as_view(), name='reserva-cancelar'),
] + router.urls
