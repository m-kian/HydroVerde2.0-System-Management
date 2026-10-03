from rest_framework import serializers

from .models import Reading


class ReadingSerializer(serializers.ModelSerializer):
    ph = serializers.FloatField(min_value=0, max_value=14)
    humidity = serializers.FloatField(min_value=0, max_value=100)
    water_level = serializers.FloatField(min_value=0, max_value=100)
    temperature = serializers.FloatField(min_value=-40, max_value=100)

    class Meta:
        model = Reading
        fields = ("id", "ph", "temperature", "humidity", "water_level", "shade_net_active", "source", "device_id", "created_at")
        read_only_fields = ("id", "source", "device_id", "created_at")
