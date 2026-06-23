from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import MonitoredWebsite, UptimeCheck


class UptimeCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = UptimeCheck
        fields = ['id', 'status_code', 'response_time_ms', 'is_up', 'error_message', 'checked_at']
        read_only_fields = ['id', 'checked_at']


class WebsiteSerializer(serializers.ModelSerializer):
    latest_check = serializers.SerializerMethodField()

    class Meta:
        model = MonitoredWebsite
        fields = ['id', 'name', 'url', 'is_active', 'created_at', 'updated_at', 'latest_check']
        read_only_fields = ['id', 'created_at', 'updated_at', 'latest_check']

    def get_latest_check(self, obj):
        latest = obj.checks.first()
        if latest:
            return UptimeCheckSerializer(latest).data
        return None

    def validate_url(self, value):
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError('URL must start with http:// or https://')
        return value


class WebsiteDetailSerializer(serializers.ModelSerializer):
    latest_check = serializers.SerializerMethodField()
    checks = serializers.SerializerMethodField()

    class Meta:
        model = MonitoredWebsite
        fields = ['id', 'name', 'url', 'is_active', 'created_at', 'updated_at', 'latest_check', 'checks']
        read_only_fields = ['id', 'created_at', 'updated_at', 'latest_check', 'checks']

    def get_latest_check(self, obj):
        latest = obj.checks.first()
        if latest:
            return UptimeCheckSerializer(latest).data
        return None

    def get_checks(self, obj):
        return UptimeCheckSerializer(obj.checks.all()[:100], many=True).data


class WebsiteStatsSerializer(serializers.Serializer):
    total_checks = serializers.IntegerField()
    uptime_percentage_24h = serializers.FloatField()
    uptime_percentage_7d = serializers.FloatField()
    uptime_percentage_30d = serializers.FloatField()
    current_status = serializers.BooleanField(allow_null=True)
    last_check = UptimeCheckSerializer(allow_null=True)
    average_response_time_ms = serializers.FloatField(allow_null=True)


class SSLCheckSerializer(serializers.Serializer):
    hostname = serializers.CharField()
    is_valid = serializers.BooleanField()
    issuer = serializers.CharField(allow_null=True)
    subject = serializers.CharField(allow_null=True)
    expires_at = serializers.DateTimeField(allow_null=True)
    days_remaining = serializers.IntegerField(allow_null=True)
    error_message = serializers.CharField(allow_null=True)