from rest_framework import serializers
from apps.users.models import Estacionamiento


class EstacionamientoSerializer(serializers.ModelSerializer):

    espacios_totales = serializers.IntegerField(read_only=True)
    espacios_disponibles = serializers.IntegerField(read_only=True)

    class Meta:
        model = Estacionamiento
        fields = ["id", "nombre", "direccion", "latitud", "longitud",
                  "precio_por_hora", "activo", "plan_destacado", "created_at",
                  "espacios_totales", "espacios_disponibles"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "precio_por_hora": {"min_value": 0},
            "latitud": {"min_value": -90, "max_value": 90},
            "longitud": {"min_value": -180, "max_value": 180},
        }


class FiltrosSerializer(serializers.Serializer):
    direccion = serializers.CharField(required=False, allow_blank=True, max_length=255)
    disponibilidad = serializers.ChoiceField(
        choices=["todos", "disponible", "completo"], default="todos"
    )
    precio_min = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, min_value=0)
    precio_max = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, min_value=0)
    orden = serializers.ChoiceField(
        choices=["nombre", "-nombre", "precio_por_hora", "-precio_por_hora"],
        default="nombre"
    )

    def validate(self, data):
        if ("precio_min" in data and "precio_max" in data
                and data["precio_min"] > data["precio_max"]):
            raise serializers.ValidationError(
                {"precio_max": "El precio máximo debe ser mayor o igual al mínimo."}
            )
        return data
