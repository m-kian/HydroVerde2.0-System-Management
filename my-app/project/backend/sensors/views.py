from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import hmac

from django.conf import settings
from django.core.cache import cache
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .lorawan import parse_uplink
from .models import Reading
from .permissions import HasDeviceKey
from .serializers import ReadingSerializer


def save_and_broadcast(data, source, device_id=""):
    s = ReadingSerializer(data=data)
    s.is_valid(raise_exception=True)
    reading = s.save(source=source, device_id=device_id)
    out = ReadingSerializer(reading).data
    async_to_sync(get_channel_layer().group_send)(
        "sensors", {"type": "push", "data": {"type": "reading", "reading": out}}
    )
    return out


class ReadingIngestView(APIView):
    """Device -> server over WiFi/HTTP. Saves the reading and pushes it live to every connected app."""

    authentication_classes = []
    permission_classes = [HasDeviceKey]

    def post(self, request):
        return Response(save_and_broadcast(request.data, "direct"), status=status.HTTP_201_CREATED)


class LoRaWANUplinkView(APIView):
    """Webhook target for The Things Network / ChirpStack uplinks."""

    authentication_classes = []
    permission_classes = [HasDeviceKey]

    def post(self, request):
        parsed = parse_uplink(request.data)
        if parsed is None:  # join/ack/etc: acknowledge so the network server doesn't retry
            return Response({"ignored": True})
        device_id, data = parsed
        return Response(save_and_broadcast(data, "lorawan", device_id), status=status.HTTP_201_CREATED)


class LatestReadingView(APIView):
    def get(self, request):
        r = Reading.objects.first()
        return Response(ReadingSerializer(r).data if r else None)


class ReadingHistoryView(generics.ListAPIView):
    """GET /api/readings/?limit=100  (newest first, max 1000)"""

    serializer_class = ReadingSerializer
    pagination_class = None

    def get_queryset(self):
        try:
            limit = min(int(self.request.query_params.get("limit", 100)), 1000)
        except ValueError:
            limit = 100
        return Reading.objects.all()[:limit]


CACHE_RELAY_3 = "hydroverde_relay_3"
CACHE_RELAY_4 = "hydroverde_relay_4"


class RelayControlView(APIView):
    """GET returns relay state to devices, POST changes state from the app."""

    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        key = self.request.headers.get("X-Device-Key", "")
        if key and hasattr(settings, "DEVICE_API_KEY"):
            if hmac.compare_digest(key, settings.DEVICE_API_KEY):
                return []
        if getattr(self.request, "auth", None) is not None:
            return []
        return [IsAuthenticated()]

    def get(self, request):
        return Response(
            {
                "relay_3": bool(cache.get(CACHE_RELAY_3, False)),
                "relay_4": bool(cache.get(CACHE_RELAY_4, False)),
            }
        )

    def post(self, request):
        key = request.headers.get("X-Device-Key", "")
        is_device = bool(
            key
            and hasattr(settings, "DEVICE_API_KEY")
            and hmac.compare_digest(key, settings.DEVICE_API_KEY)
        )
        if not is_device:
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication required."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        relay_3 = request.data.get("relay_3")
        relay_4 = request.data.get("relay_4")
        if relay_3 is not None:
            cache.set(CACHE_RELAY_3, bool(relay_3), timeout=None)
        if relay_4 is not None:
            cache.set(CACHE_RELAY_4, bool(relay_4), timeout=None)
        return self.get(request)
