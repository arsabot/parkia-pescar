from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.parking.urls')), #Prueba Parking 
    path('api/', include('apps.estacionamientos.urls')),
    path('api-auth/', include('rest_framework.urls')),
]

