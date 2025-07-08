from djangochannelsrestframework.consumers import AsyncAPIConsumer
from djangochannelsrestframework.decorators import action

class DocumentConsumer(AsyncAPIConsumer):

    @action()
    async def subscribe(self, request_id, doc_id, **kwargs):
        await self.channel_layer.group_add(f"doc_{doc_id}", self.channel_name)
        return {"status": "subscribed"}, 200

    @action()
    async def unsubscribe(self, request_id, doc_id, **kwargs):
        await self.channel_layer.group_discard(f"doc_{doc_id}", self.channel_name)
        return {"status": "unsubscribed"}, 200

    @action()
    async def send_delta(self, request_id, doc_id, delta, **kwargs):
        await self.channel_layer.group_send(
            f"doc_{doc_id}",
            {
                "type": "broadcast_delta",
                "request_id": request_id,
                "delta": delta,
            }
        )
        return {"status": "ok"}, 200

    async def broadcast_delta(self, event):
        await self.send_json({
            "action": "receive_delta",
            "request_id": event["request_id"],
            "delta": event["delta"],
        })
