import hmac

from django.conf import settings
from rest_framework import permissions


class HasDeviceKey(permissions.BasePermission):
    """ESP32 / LoRaWAN gateway sends header:  X-Device-Key: <DEVICE_API_KEY>"""

    def has_permission(self, request, view):
        key = request.headers.get("X-Device-Key", "")
        return bool(settings.DEVICE_API_KEY) and hmac.compare_digest(key, settings.DEVICE_API_KEY)
