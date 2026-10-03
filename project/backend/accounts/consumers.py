from channels.generic.websocket import AsyncJsonWebsocketConsumer


class UserConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            # Accept first so the browser can read the 4401 close code and stop retrying.
            await self.accept()
            await self.close(code=4401)
            return
        self.group = f"user_{user.id}"
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.channel_layer.group_add("sensors", self.channel_name)
        await self.accept()
        await self.send_json({"type": "connected", "user": {"id": user.id, "name": user.name}})

    async def disconnect(self, code):
        if hasattr(self, "group"):
            await self.channel_layer.group_discard(self.group, self.channel_name)
            await self.channel_layer.group_discard("sensors", self.channel_name)

    async def receive_json(self, content):
        if content.get("type") == "ping":
            await self.send_json({"type": "pong"})

    # Server-side code can push to a user with:
    #   async_to_sync(channel_layer.group_send)(f"user_{id}", {"type": "push", "data": {...}})
    async def push(self, event):
        await self.send_json(event["data"])
