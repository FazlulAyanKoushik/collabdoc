from django.urls import path
from .views import (
    DocumentListCreateView,
    DocumentDetailView,
    DocumentDeleteView,
    DocumentPermissionListCreateView,
    DocumentPermissionDetailView
)

urlpatterns = [
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/delete/', DocumentDeleteView.as_view(), name='document-delete'),

    path('permissions/', DocumentPermissionListCreateView.as_view(), name='permission-list-create'),
    path('permissions/<int:pk>/', DocumentPermissionDetailView.as_view(), name='permission-detail'),
]
