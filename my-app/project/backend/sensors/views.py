from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import generics, status
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
