from django.contrib import admin
from .models import MonitoredWebsite, UptimeCheck


@admin.register(MonitoredWebsite)
class MonitoredWebsiteAdmin(admin.ModelAdmin):
    list_display = ['name', 'url', 'user', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'url', 'user__email']


@admin.register(UptimeCheck)
class UptimeCheckAdmin(admin.ModelAdmin):
    list_display = ['website', 'is_up', 'status_code', 'response_time_ms', 'checked_at']
    list_filter = ['is_up', 'checked_at']
    search_fields = ['website__name', 'website__url']