from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Q
from django.utils import timezone
from datetime import timedelta

from .models import MonitoredWebsite, UptimeCheck
from .serializers import (
    WebsiteSerializer,
    WebsiteDetailSerializer,
    UptimeCheckSerializer,
    WebsiteStatsSerializer,
    SSLCheckSerializer,
)


class WebsiteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WebsiteDetailSerializer
        return WebsiteSerializer

    def get_queryset(self):
        return MonitoredWebsite.objects.filter(user=self.request.user).prefetch_related('checks')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def checks(self, request, pk=None):
        website = self.get_object()
        checks = website.checks.all()[:100]
        page = self.paginate_queryset(checks)
        if page is not None:
            serializer = UptimeCheckSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = UptimeCheckSerializer(checks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        website = self.get_object()
        now = timezone.now()
        checks_24h = website.checks.filter(checked_at__gte=now - timedelta(hours=24))
        checks_7d = website.checks.filter(checked_at__gte=now - timedelta(days=7))
        checks_30d = website.checks.filter(checked_at__gte=now - timedelta(days=30))

        def uptime_pct(qs):
            total = qs.count()
            if total == 0:
                return 0.0
            up = qs.filter(is_up=True).count()
            return round((up / total) * 100, 2)

        avg_response = website.checks.filter(response_time_ms__isnull=False).aggregate(
            avg=Avg('response_time_ms')
        )['avg']
        last_check = website.checks.first()

        data = {
            'total_checks': website.checks.count(),
            'uptime_percentage_24h': uptime_pct(checks_24h),
            'uptime_percentage_7d': uptime_pct(checks_7d),
            'uptime_percentage_30d': uptime_pct(checks_30d),
            'current_status': last_check.is_up if last_check else None,
            'last_check': UptimeCheckSerializer(last_check).data if last_check else None,
            'average_response_time_ms': round(avg_response, 2) if avg_response else None,
        }
        return Response(data)

    @action(detail=True, methods=['get'])
    def ssl_check(self, request, pk=None):
        website = self.get_object()
        from monitoring.services.checker import check_ssl
        result = check_ssl(website)
        serializer = SSLCheckSerializer(result)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def check(self, request, pk=None):
        website = self.get_object()
        from monitoring.services.checker import check_website, check_ssl
        uptime = check_website(website)
        ssl = check_ssl(website)
        return Response({
            'uptime': UptimeCheckSerializer(uptime).data,
            'ssl': SSLCheckSerializer(ssl).data,
        }, status=201)