from django.urls import path
from .views import (
    DocumentListCreateView,
    DocumentDetailView,
    DocumentDeleteView,
    DocumentPermissionListCreateView,
    DocumentPermissionDetailView,
    UserRegistrationView,
    UserListView
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/delete/', DocumentDeleteView.as_view(), name='document-delete'),

    path('permissions/', DocumentPermissionListCreateView.as_view(), name='permission-list-create'),
    path('permissions/<int:pk>/', DocumentPermissionDetailView.as_view(), name='permission-detail'),

    path('users/', UserListView.as_view(), name='user-list'),
]
