from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.permissions import BasePermission

from .models import Document, DocumentPermission
from .serializers import (
    DocumentSerializer,
    DocumentDetailSerializer,
    DocumentPermissionSerializer,
    UserRegistrationSerializer,
)


# 📄 Document Permissions

class CanViewOrEditDocument(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'PATCH']:
            return obj.created_by == request.user or obj.permissions.filter(user=request.user).exists()
        return obj.created_by == request.user

# 📄 Document Views

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentDetailSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewOrEditDocument]


class DocumentDeleteView(generics.DestroyAPIView):
    queryset = Document.objects.all()
    permission_classes = [permissions.IsAuthenticated]


# 👥 Permission Views

class DocumentPermissionListCreateView(generics.ListCreateAPIView):
    queryset = DocumentPermission.objects.all()
    serializer_class = DocumentPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentPermissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentPermission.objects.all()
    serializer_class = DocumentPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer