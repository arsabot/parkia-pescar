import logging
from rest_framework import views, status, permissions
from rest_framework.response import Response
from apps.users.models import Pago, Reserva
from .serializers import PreferenciaRequestSerializer, ConfirmarPagoSerializer, PagoSerializer
from .services import crear_preferencia_mercadopago, procesar_pago_aprobado

logger = logging.getLogger(__name__)


class CrearPreferenciaMercadoPagoView(views.APIView):
    """
    Crea una preferencia de pago para una reserva y retorna el link de Mercado Pago (Checkout Pro y Sandbox)
    junto con el código QR para abonar desde la app móvil.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PreferenciaRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        reserva = Reserva.objects.get(id=serializer.validated_data["reserva_id"])
        base_url = serializer.validated_data.get("base_url") or "http://127.0.0.1:8000"

        try:
            preferencia = crear_preferencia_mercadopago(reserva, base_url=base_url)
            return Response(preferencia, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("Error al crear preferencia en Mercado Pago: %s", e)
            return Response(
                {"error": "No se pudo generar la preferencia de pago en Mercado Pago", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConfirmarPagoView(views.APIView):
    """
    Confirma un pago como aprobado y actualiza la reserva a CONFIRMADA.
    Utilizado por el flujo de checkout al completarse el pago o en modo simulación de Sandbox.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ConfirmarPagoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        pago = Pago.objects.get(id=serializer.validated_data["pago_id"])
        ref = serializer.validated_data.get("referencia_pago") or f"MP-PAY-{pago.id}"

        pago_actualizado = procesar_pago_aprobado(pago, referencia_pago=ref)
        data = PagoSerializer(pago_actualizado).data
        data["reserva_estado"] = pago.reserva.estado

        return Response({
            "message": "Pago aprobado con éxito a través de Mercado Pago.",
            "pago": data
        }, status=status.HTTP_200_OK)


class DetallePagoView(views.APIView):
    """
    Consulta el estado del pago asociado a una reserva.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, reserva_id):
        try:
            pago = Pago.objects.filter(reserva_id=reserva_id).latest('created_at')
            return Response(PagoSerializer(pago).data)
        except Pago.DoesNotExist:
            return Response({"error": "No se encontró ningún pago para esta reserva."}, status=status.HTTP_404_NOT_FOUND)


class MercadoPagoWebhookView(views.APIView):
    """
    Recibe notificaciones webhook de Mercado Pago (IPN / Webhooks)
    y aprueba el pago automáticamente con validación de idempotencia.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        topic = request.query_params.get("topic") or data.get("type")
        event_id = request.query_params.get("id") or data.get("data", {}).get("id") or data.get("id")

        logger.info("Webhook recibido de Mercado Pago: topic=%s id=%s", topic, event_id)

        # Buscar por referencia externa o id
        if event_id:
            pago = Pago.objects.filter(referencia_externa__icontains=str(event_id)).first()
            if pago and pago.estado != Pago.Estado.APROBADO:
                procesar_pago_aprobado(pago, referencia_pago=f"WEBHOOK-MP-{event_id}")

        return Response({"status": "received", "topic": topic, "id": event_id}, status=status.HTTP_200_OK)
