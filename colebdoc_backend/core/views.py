from rest_framework import generics, permissions
from .models import Document, DocumentPermission
from .serializers import (
    DocumentSerializer,
    DocumentDetailSerializer,
    DocumentPermissionSerializer
)

# 📄 Document Views

class DocumentListCreateView(generics.ListCreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


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
