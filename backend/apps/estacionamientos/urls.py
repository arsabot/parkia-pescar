from rest_framework.routers import DefaultRouter
from .views import EstacionamientoViewSet

router = DefaultRouter()
router.register("estacionamientos", EstacionamientoViewSet, basename="estacionamiento")
urlpatterns = router.urls
