from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.estacionamientos.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
