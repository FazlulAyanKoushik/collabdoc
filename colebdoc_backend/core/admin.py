from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from .models import Document, DocumentPermission

# 🧹 Unregister default User first
admin.site.unregister(User)

# ✅ Register with customization (optional)
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active')
    search_fields = ('username', 'email')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by', 'created_at', 'updated_at')
    list_filter = ('created_by',)
    search_fields = ('title',)

@admin.register(DocumentPermission)
class DocumentPermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'document', 'role')
    list_filter = ('role', 'document', 'user')
    search_fields = ('document__title', 'user__username')
