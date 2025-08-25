from django.contrib import admin
from .models import User, UserProfile, Contact
from django.contrib.sessions.models import Session

# Register your models here.
admin.site.register(User)
admin.site.register(UserProfile)
admin.site.register(Contact)

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'get_decoded', 'expire_date')