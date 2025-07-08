from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    crdt_state = models.JSONField(default=dict)  # store serialized CRDT doc

    def __str__(self):
        return self.title


class DocumentPermission(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='permissions')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    class Meta:
        unique_together = ('user', 'document')
