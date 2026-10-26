from rest_framework import serializers
from apps.users.models import Reserva, Estacionamiento, EspacioEstacionamiento, User, Pago

class ReservaItemSerializer(serializers.ModelSerializer):
    estacionamiento_nombre = serializers.CharField(source='estacionamiento.nombre', read_only=True)
    estacionamiento_direccion = serializers.CharField(source='estacionamiento.direccion', read_only=True)
    espacio_numero = serializers.CharField(source='espacio.codigo', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    codigo_qr = serializers.SerializerMethodField()
    pago_estado = serializers.SerializerMethodField()
    pago_proveedor = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            'id', 'estacionamiento', 'estacionamiento_nombre', 'estacionamiento_direccion',
            'espacio', 'espacio_numero', 'fecha_inicio', 'fecha_fin',
            'precio_total', 'estado', 'estado_display', 'codigo_qr',
            'pago_estado', 'pago_proveedor', 'created_at'
        ]

    def get_codigo_qr(self, obj):
        return f"#PK-{obj.id:05d}"

    def get_pago_estado(self, obj):
        pago = obj.pagos.first()
        return pago.estado if pago else 'PENDIENTE'

    def get_pago_proveedor(self, obj):
        pago = obj.pagos.first()
        return pago.proveedor if pago else None


class CrearReservaSerializer(serializers.Serializer):
    estacionamiento_id = serializers.IntegerField(required=True)
    espacio_id = serializers.IntegerField(required=False, allow_null=True)
    fecha_inicio = serializers.DateTimeField(required=True)
    fecha_fin = serializers.DateTimeField(required=True)
    usuario_email = serializers.EmailField(required=False, default='conductor@parkia.com')

    def validate(self, data):
        if data['fecha_inicio'] >= data['fecha_fin']:
            raise serializers.ValidationError({"fecha_fin": "La hora de salida debe ser posterior a la de entrada."})
        return data
