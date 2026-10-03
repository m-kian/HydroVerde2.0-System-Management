"""Parse LoRaWAN network-server webhooks (The Things Network v3, ChirpStack v4)."""
import base64
import struct

from rest_framework.exceptions import ValidationError

FIELDS = ("ph", "temperature", "humidity", "water_level", "shade_net_active")

# 7-byte uplink, big-endian:
#   0-1 pH x100 (uint16) | 2-3 temperature x100 (int16, °C) | 4 humidity % | 5 water level % | 6 shade net (0/1)
FORMAT = ">HhBBB"


def decode_bytes(raw: bytes) -> dict:
    if len(raw) < struct.calcsize(FORMAT):
        raise ValidationError("Payload too short (expected 7 bytes).")
    ph, temp, hum, water, shade = struct.unpack(FORMAT, raw[:7])
    return {
        "ph": ph / 100,
        "temperature": temp / 100,
        "humidity": hum,
        "water_level": water,
        "shade_net_active": bool(shade),
    }


def parse_uplink(body: dict):
    """Returns (device_id, reading_dict) or None if the event isn't an uplink."""
    if "uplink_message" in body:  # The Things Network v3
        um = body["uplink_message"]
        device_id = body.get("end_device_ids", {}).get("device_id", "")
        decoded, b64 = um.get("decoded_payload"), um.get("frm_payload")
    elif "data" in body or "object" in body:  # ChirpStack v4
        device_id = (body.get("deviceInfo") or {}).get("deviceName", "")
        decoded, b64 = body.get("object"), body.get("data")
    else:
        return None

    if isinstance(decoded, dict) and all(k in decoded for k in FIELDS):
        return device_id, {k: decoded[k] for k in FIELDS}
    if b64:
        try:
            return device_id, decode_bytes(base64.b64decode(b64))
        except (ValueError, struct.error):
            raise ValidationError("Invalid base64 payload.")
    raise ValidationError("No payload found in uplink.")
