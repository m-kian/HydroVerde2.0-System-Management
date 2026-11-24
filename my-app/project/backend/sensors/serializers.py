from rest_framework import serializers

from .models import Reading


class ReadingSerializer(serializers.ModelSerializer):
    ph = serializers.FloatField(min_value=0, max_value=14, required=False, allow_null=True)
    humidity = serializers.FloatField(min_value=0, max_value=100, required=False, allow_null=True)
    water_level = serializers.FloatField(min_value=0, max_value=100, required=False, allow_null=True)
    temperature = serializers.FloatField(min_value=-40, max_value=100, required=False, allow_null=True)

    def validate(self, attrs):
        if attrs.get("temperature") is None:
            raise serializers.ValidationError({"temperature": "This field is required."})
        if attrs.get("humidity") is None:
            raise serializers.ValidationError({"humidity": "This field is required."})
        return attrs

    class Meta:
        model = Reading
        fields = ("id", "ph", "temperature", "humidity", "water_level", "shade_net_active", "source", "device_id", "created_at")
        read_only_fields = ("id", "source", "device_id", "created_at")
