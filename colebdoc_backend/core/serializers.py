from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Document, DocumentPermission


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

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
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, source='user')

    class Meta:
        model = DocumentPermission
        fields = ['id', 'user', 'user_id', 'document', 'role']



class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
