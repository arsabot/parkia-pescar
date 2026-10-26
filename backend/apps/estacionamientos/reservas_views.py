from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from apps.users.models import Reserva, Estacionamiento, EspacioEstacionamiento, User
from apps.users.services import crear_reserva, cancelar_reserva, ReservaInvalidaError, EspacioNoDisponibleError
from .reservas_serializers import ReservaItemSerializer, CrearReservaSerializer


class ReservaListCreateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        reservas = Reserva.objects.select_related('estacionamiento', 'espacio').prefetch_related('pagos').all()
        serializer = ReservaItemSerializer(reservas, many=True)
        return Response({"results": serializer.data, "count": len(serializer.data)})

    def post(self, request):
        serializer = CrearReservaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        datos = serializer.validated_data
        
        # Obtener o asignar usuario
        user = None
        if request.user and request.user.is_authenticated:
            user = request.user
        else:
            email = datos.get('usuario_email') or 'conductor@parkia.com'
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.filter(role=User.Role.DRIVER).first() or User.objects.first()

        try:
            estacionamiento = Estacionamiento.objects.get(id=datos['estacionamiento_id'])
        except Estacionamiento.DoesNotExist:
            return Response({"error": "El estacionamiento no existe."}, status=status.HTTP_404_NOT_FOUND)

        # Buscar espacio si no se proveyó
        espacio_id = datos.get('espacio_id')
        if not espacio_id:
            espacio = estacionamiento.espacios.filter(estado=EspacioEstacionamiento.Estado.LIBRE).first()
            if not espacio:
                # Si todos están asignados, tomar el primer espacio del estacionamiento
                espacio = estacionamiento.espacios.first()
            if not espacio:
                # Si no tiene espacios configurados, crear uno por defecto
                espacio = EspacioEstacionamiento.objects.create(
                    estacionamiento=estacionamiento,
                    codigo="A-01",
                    estado=EspacioEstacionamiento.Estado.LIBRE
                )
            espacio_id = espacio.id

        try:
            # Crear la reserva mediante el servicio atómico
            reserva = crear_reserva(
                usuario=user,
                espacio_id=espacio_id,
                fecha_inicio=datos['fecha_inicio'],
                fecha_fin=datos['fecha_fin']
            )
            reserva.estacionamiento = estacionamiento
            reserva.save(update_fields=['estacionamiento'])

            return Response(ReservaItemSerializer(reserva).data, status=status.HTTP_201_CREATED)

        except (ReservaInvalidaError, EspacioNoDisponibleError) as err:
            return Response({"error": str(err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Error interno al crear reserva", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReservaDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            reserva = Reserva.objects.select_related('estacionamiento', 'espacio').prefetch_related('pagos').get(pk=pk)
            return Response(ReservaItemSerializer(reserva).data)
        except Reserva.DoesNotExist:
            return Response({"error": "Reserva no encontrada."}, status=status.HTTP_404_NOT_FOUND)


class ReservaCancelarView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            reserva = Reserva.objects.get(pk=pk)
            cancelar_reserva(reserva)
            return Response({
                "message": "Reserva cancelada con éxito.",
                "reserva": ReservaItemSerializer(reserva).data
            })
        except Reserva.DoesNotExist:
            return Response({"error": "Reserva no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
