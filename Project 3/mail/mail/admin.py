from django.contrib import admin

from .models import Email, User

class EmailAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "subject", "body", "timestamp")

# Register Model to Admin
admin.site.register(Email, EmailAdmin)
admin.site.register(User)