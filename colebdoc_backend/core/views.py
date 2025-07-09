from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.permissions import BasePermission

from .models import Document, DocumentPermission
from .serializers import (
    DocumentSerializer,
    DocumentDetailSerializer,
    DocumentPermissionSerializer,
    UserRegistrationSerializer, UserSerializer,
)
from django.db.models import Q



# 📄 Document Permissions

class CanViewOrEditDocument(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'PATCH']:
            return obj.created_by == request.user or obj.permissions.filter(user=request.user).exists()
        return obj.created_by == request.user


class IsOwnerOrSharedEditor(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.created_by == request.user:
            return True
        return DocumentPermission.objects.filter(
            document=obj, user=request.user, role='editor'
        ).exists()

# 📄 Document Views

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # return owned + shared documents
        doc_ids = DocumentPermission.objects.filter(user=user).values_list('document_id', flat=True)
        return Document.objects.filter(Q(created_by=user) | Q(id__in=doc_ids))

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)



class DocumentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrSharedEditor]


class DocumentDeleteView(generics.DestroyAPIView):
    queryset = Document.objects.all()
    permission_classes = [permissions.IsAuthenticated]


# 👥 Permission Views
class DocumentPermissionListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DocumentPermission.objects.filter(document__created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save()


class DocumentPermissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentPermission.objects.all()
    serializer_class = DocumentPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer



class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        search = self.request.query_params.get('search', '')
        return User.objects.filter(username__icontains=search)