from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Recipe, Post, Rating, Comment

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active')
    ordering = ('email',)

    # To use email instead of username for the admin login
    fieldsets = UserAdmin.fieldsets
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_active', 'is_staff')}
        ),
    )

# Register the CustomUser model
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Recipe)
admin.site.register(Post)
admin.site.register(Rating)
admin.site.register(Comment)
