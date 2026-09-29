from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.users.models import Estacionamiento, EspacioEstacionamiento
from .permissions import LecturaPublicaEscrituraStaff
from .serializers import EstacionamientoSerializer, FiltrosSerializer


class PaginacionEstacionamientos(PageNumberPagination):
    page_size = 20


class EstacionamientoViewSet(viewsets.ModelViewSet):

    serializer_class = EstacionamientoSerializer
    permission_classes = [LecturaPublicaEscrituraStaff]
    pagination_class = PaginacionEstacionamientos
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):

        consulta = Estacionamiento.objects.annotate(
            espacios_totales=Count("espacios"),
            espacios_disponibles=Count(
                "espacios", filter=Q(espacios__estado=EspacioEstacionamiento.Estado.LIBRE)
            ),
        )

        if self.action == "list":
            filtros = FiltrosSerializer(data=self.request.query_params)
            filtros.is_valid(raise_exception=True)
            datos = filtros.validated_data
            if datos.get("direccion"):
                consulta = consulta.filter(direccion__icontains=datos["direccion"])
            if "precio_min" in datos:
                consulta = consulta.filter(precio_por_hora__gte=datos["precio_min"])
            if "precio_max" in datos:
                consulta = consulta.filter(precio_por_hora__lte=datos["precio_max"])
            if datos["disponibilidad"] == "disponible":
                consulta = consulta.filter(activo=True, espacios_disponibles__gt=0)
            elif datos["disponibilidad"] == "completo":
                consulta = consulta.filter(
                    activo=True, espacios_totales__gt=0, espacios_disponibles=0
                )
            return consulta.order_by(datos["orden"], "pk")
        return consulta.order_by("nombre", "pk")

    def destroy(self, request, *args, **kwargs):
        item = self.get_object()


        if item.espacios.filter(reservas__isnull=False).exists():
            return Response(
                {"detail": "Tiene reservas asociadas. Desactivalo para conservar el historial."},
                status=status.HTTP_409_CONFLICT,
            )
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        item = self.get_object()
        item.activo = False
        item.save(update_fields=["activo"])
        return Response(self.get_serializer(item).data)
