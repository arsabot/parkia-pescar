from rest_framework import serializers
from decimal import Decimal
from apps.users.models import ComercioCercano, PlanSuscripcion, Estacionamiento, User, SuscripcionB2C


class ComercioCercanoSerializer(serializers.ModelSerializer):
    rubro_display = serializers.CharField(source='get_rubro_display', read_only=True)
    icono = serializers.SerializerMethodField()

    class Meta:
        model = ComercioCercano
        fields = [
            'id', 'nombre', 'rubro', 'rubro_display', 'direccion',
            'descuento', 'distancia_metros', 'estacionamiento',
            'activo', 'pauta_mensual', 'icono', 'created_at'
        ]

    def get_icono(self, obj):
        iconos = {
            ComercioCercano.Rubro.CAFETERIA: '☕',
            ComercioCercano.Rubro.GASTRONOMIA: '🍽️',
            ComercioCercano.Rubro.LAVADERO: '🚗✨',
            ComercioCercano.Rubro.SHOPPING: '🛍️',
            ComercioCercano.Rubro.ENTRETENIMIENTO: '🎬',
        }
        return iconos.get(obj.rubro, '📍')


class PlanSuscripcionSerializer(serializers.ModelSerializer):
    nivel_display = serializers.CharField(source='get_nivel_display', read_only=True)

    class Meta:
        model = PlanSuscripcion
        fields = [
            'id', 'nivel', 'nivel_display', 'precio_mensual',
            'destacado_listado', 'estadisticas', 'descripcion'
        ]


class ContratarPlanSerializer(serializers.Serializer):
    estacionamiento_id = serializers.IntegerField(required=True)
    plan_nivel = serializers.ChoiceField(choices=['basico', 'premium'], required=True)


class ParkiaPassStatusSerializer(serializers.Serializer):
    es_parkia_pass = serializers.BooleanField()
    parkia_pass_vence = serializers.DateField(allow_null=True)
    descuento_pct = serializers.IntegerField(default=10)
    precio_mensual = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('2999.00'))
    beneficios = serializers.ListField(child=serializers.CharField())


class ContratarParkiaPassSerializer(serializers.Serializer):
    usuario_email = serializers.EmailField(required=False, default='conductor@parkia.com')
    meses = serializers.IntegerField(default=1, min_value=1, max_value=12)
