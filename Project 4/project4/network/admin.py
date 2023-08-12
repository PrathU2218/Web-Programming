from django.contrib import admin
from .models import User, Post, Profile

class PostAdmin(admin.ModelAdmin):
    """Contains Post model admin page config"""
    list_display = ("id", "user", "content", "timestamp")

admin.site.register(User)
admin.site.register(Post, PostAdmin)
admin.site.register(Profile)