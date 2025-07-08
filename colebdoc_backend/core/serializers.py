from rest_framework import serializers
from .models import Document, DocumentPermission

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class DocumentDetailSerializer(serializers.ModelSerializer):
    crdt_state = serializers.JSONField()

    class Meta:
        model = Document
        fields = ['id', 'title', 'created_by', 'created_at', 'updated_at', 'crdt_state']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class DocumentPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentPermission
        fields = ['id', 'user', 'document', 'role']
