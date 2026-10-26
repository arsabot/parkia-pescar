from rest_framework import serializers
from apps.users.models import Pago, Reserva

class PreferenciaRequestSerializer(serializers.Serializer):
    reserva_id = serializers.IntegerField(required=True)
    base_url = serializers.CharField(required=False, default='http://127.0.0.1:8000')

    def validate_reserva_id(self, value):
        if not Reserva.objects.filter(id=value).exists():
            raise serializers.ValidationError("La reserva especificada no existe.")
        return value


class ConfirmarPagoSerializer(serializers.Serializer):
    pago_id = serializers.IntegerField(required=True)
    referencia_pago = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_pago_id(self, value):
        if not Pago.objects.filter(id=value).exists():
            raise serializers.ValidationError("El registro de pago no existe.")
        return value


class PagoSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    proveedor_display = serializers.CharField(source='get_proveedor_display', read_only=True)
    metodo_display = serializers.CharField(source='get_metodo_display', read_only=True)

    class Meta:
        model = Pago
        fields = [
            'id', 'reserva', 'monto', 'metodo', 'metodo_display',
            'proveedor', 'proveedor_display', 'estado', 'estado_display',
            'referencia_externa', 'fecha_pago', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
