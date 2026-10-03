from asgiref.sync import sync_to_async
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from accounts.models import User
from config.asgi import application

GOOD = {"ph": 6.2, "temperature": 24.5, "humidity": 70, "water_level": 80, "shade_net_active": True}


class SensorTests(TransactionTestCase):
    def test_ingest_requires_key(self):
        c = APIClient()
        assert c.post("/api/readings/ingest/", GOOD, format="json").status_code == 403
        assert c.post("/api/readings/ingest/", GOOD, format="json", HTTP_X_DEVICE_KEY="bad").status_code == 403

    def test_validation_and_latest(self):
        c = APIClient()
        bad = dict(GOOD, ph=20)
        assert c.post("/api/readings/ingest/", bad, format="json", HTTP_X_DEVICE_KEY="dev-device-key").status_code == 400
        assert c.post("/api/readings/ingest/", GOOD, format="json", HTTP_X_DEVICE_KEY="dev-device-key").status_code == 201
        u = User.objects.create_user(email="a@b.com", password="pw123456", name="A")
        c.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=u).key}")
        r = c.get("/api/readings/latest/").json()
        assert r["ph"] == 6.2 and r["shade_net_active"] is True

    async def test_live_push(self):
        u = await sync_to_async(User.objects.create_user)(email="a@b.com", password="pw123456", name="A")
        tok = await sync_to_async(Token.objects.create)(user=u)
        ws = WebsocketCommunicator(application, f"/ws/?token={tok.key}")
        await ws.connect()
        await ws.receive_json_from()  # connected
        def post():
            return APIClient().post("/api/readings/ingest/", GOOD, format="json", HTTP_X_DEVICE_KEY="dev-device-key")
        assert (await sync_to_async(post)()).status_code == 201
        msg = await ws.receive_json_from()
        assert msg["type"] == "reading" and msg["reading"]["water_level"] == 80
        await ws.disconnect()


class LoRaWANTests(TransactionTestCase):
    KEY = {"HTTP_X_DEVICE_KEY": "dev-device-key"}
    # pH 6.20, 24.50 C, 70 %, 80 %, shade on
    B64 = "AmwJkkZQAQ=="

    def test_ttn_uplink_raw_bytes(self):
        body = {"end_device_ids": {"device_id": "hydro-node-1"}, "uplink_message": {"frm_payload": self.B64}}
        r = APIClient().post("/api/readings/lorawan/uplink/", body, format="json", **self.KEY)
        assert r.status_code == 201, r.content
        d = r.json()
        assert d["ph"] == 6.2 and d["temperature"] == 24.5 and d["shade_net_active"] is True
        assert d["source"] == "lorawan" and d["device_id"] == "hydro-node-1"

    def test_ttn_uplink_decoded_payload(self):
        dec = {"ph": 7.0, "temperature": 22, "humidity": 60, "water_level": 50, "shade_net_active": False}
        body = {"end_device_ids": {"device_id": "n2"}, "uplink_message": {"decoded_payload": dec}}
        assert APIClient().post("/api/readings/lorawan/uplink/", body, format="json", **self.KEY).status_code == 201

    def test_chirpstack_uplink(self):
        body = {"deviceInfo": {"deviceName": "cs-node"}, "data": self.B64}
        r = APIClient().post("/api/readings/lorawan/uplink/", body, format="json", **self.KEY)
        assert r.status_code == 201 and r.json()["device_id"] == "cs-node"

    def test_requires_key_and_ignores_non_uplink(self):
        c = APIClient()
        assert c.post("/api/readings/lorawan/uplink/", {}, format="json").status_code == 403
        assert c.post("/api/readings/lorawan/uplink/", {"join_accept": {}}, format="json", **self.KEY).json() == {"ignored": True}
