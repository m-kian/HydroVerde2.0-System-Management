from django.db import models
from django.utils import timezone


class Reading(models.Model):
    ph = models.FloatField()
    temperature = models.FloatField(help_text="°C")
    humidity = models.FloatField(help_text="% relative humidity")
    water_level = models.FloatField(help_text="% of tank capacity")
    shade_net_active = models.BooleanField(help_text="True when the shade net motor is running/deployed")
    source = models.CharField(max_length=20, default="direct", help_text="direct (WiFi/HTTP) or lorawan")
    device_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.created_at:%Y-%m-%d %H:%M} pH {self.ph}"
