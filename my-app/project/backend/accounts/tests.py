from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from rest_framework.authtoken.models import Token

from accounts.models import User
from config.asgi import application


class WebSocketTests(TransactionTestCase):
    async def test_auth_and_ping(self):
        from asgiref.sync import sync_to_async

        user = await sync_to_async(User.objects.create_user)(email="a@b.com", password="pw123456", name="A")
        tok = await sync_to_async(Token.objects.create)(user=user)
        c = WebsocketCommunicator(application, f"/ws/?token={tok.key}")
        ok, _ = await c.connect()
        assert ok
        assert (await c.receive_json_from())["type"] == "connected"
        await c.send_json_to({"type": "ping"})
        assert (await c.receive_json_from())["type"] == "pong"
        await c.disconnect()

    async def test_rejects_bad_token(self):
        c = WebsocketCommunicator(application, "/ws/?token=nope")
        ok, _ = await c.connect()
        assert not ok
