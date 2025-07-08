from channels.db import database_sync_to_async
from djangochannelsrestframework.consumers import AsyncAPIConsumer
from djangochannelsrestframework.decorators import action

from .models import DocumentPermission, Document


class DocumentConsumer(AsyncAPIConsumer):

    @action()
    async def subscribe(self, request_id, doc_id, **kwargs):
        if not await self.user_has_access(doc_id, ["owner", "editor", "viewer"]):
            return {"error": "Access denied"}, 403

        await self.channel_layer.group_add(f"doc_{doc_id}", self.channel_name)
        return {"status": "subscribed"}, 200

    @action()
    async def unsubscribe(self, request_id, doc_id, **kwargs):
        await self.channel_layer.group_discard(f"doc_{doc_id}", self.channel_name)
        return {"status": "unsubscribed"}, 200

    @action()
    async def send_delta(self, request_id, doc_id, delta, **kwargs):
        if not await self.user_has_access(doc_id, ["owner", "editor"]):
            return {"error": "Write access denied"}, 403

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

    async def user_has_access(self, doc_id, roles):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            return False

        return await self._check_permission(user, doc_id, roles)

    @database_sync_to_async
    def _check_permission(self, user, doc_id, roles):
        try:
            # Document owners always get access even if no explicit permission is recorded
            doc = Document.objects.get(id=doc_id)
            if doc.created_by == user:
                return True

            return DocumentPermission.objects.filter(
                user=user, document_id=doc_id, role__in=roles
            ).exists()
        except Document.DoesNotExist:
            return False
