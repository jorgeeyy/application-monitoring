from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from urllib.parse import urlparse

from .models import MonitoredWebsite, UptimeCheck, AggregatedCheck
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
        return MonitoredWebsite.objects.filter(user=self.request.user)

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

        # 24h: use raw checks (kept for 24h)
        checks_24h = website.checks.filter(checked_at__gte=now - timedelta(hours=24))
        total_24h = checks_24h.count()
        up_24h = checks_24h.filter(is_up=True).count() if total_24h > 0 else 0
        uptime_24h = round((up_24h / total_24h) * 100, 2) if total_24h > 0 else 0.0

        # 7d: use hourly aggregates
        cutoff_7d = now - timedelta(days=7)
        hourly_7d = AggregatedCheck.objects.filter(
            website=website, resolution='hourly', bucket_start__gte=cutoff_7d
        )
        total_checks_7d = hourly_7d.aggregate(s=Sum('total_checks'))['s'] or 0
        up_checks_7d = hourly_7d.aggregate(s=Sum('up_checks'))['s'] or 0
        uptime_7d = round((up_checks_7d / total_checks_7d) * 100, 2) if total_checks_7d > 0 else 0.0

        # 30d: use daily aggregates
        cutoff_30d = now - timedelta(days=30)
        daily_30d = AggregatedCheck.objects.filter(
            website=website, resolution='daily', bucket_start__gte=cutoff_30d
        )
        total_checks_30d = daily_30d.aggregate(s=Sum('total_checks'))['s'] or 0
        up_checks_30d = daily_30d.aggregate(s=Sum('up_checks'))['s'] or 0
        uptime_30d = round((up_checks_30d / total_checks_30d) * 100, 2) if total_checks_30d > 0 else 0.0

        # Total checks: raw (recent) + aggregated (historical)
        raw_count = website.checks.count()
        agg_count = AggregatedCheck.objects.filter(website=website).aggregate(
            s=Sum('total_checks')
        )['s'] or 0
        total_checks = raw_count + agg_count

        # Average response time from recent raw checks
        avg_response = website.checks.filter(response_time_ms__isnull=False).aggregate(
            avg=Avg('response_time_ms')
        )['avg']

        last_check = website.checks.first()

        data = {
            'total_checks': total_checks,
            'uptime_percentage_24h': uptime_24h,
            'uptime_percentage_7d': uptime_7d,
            'uptime_percentage_30d': uptime_30d,
            'current_status': last_check.is_up if last_check else None,
            'last_check': UptimeCheckSerializer(last_check).data if last_check else None,
            'average_response_time_ms': round(avg_response, 2) if avg_response else None,
        }
        return Response(data)

    @action(detail=True, methods=['get'])
    def chart(self, request, pk=None):
        website = self.get_object()
        now = timezone.now()
        hours = int(request.query_params.get('hours', 24))

        if hours <= 24:
            # Use raw checks for 24h chart
            cutoff = now - timedelta(hours=hours)
            checks = website.checks.filter(
                checked_at__gte=cutoff
            ).order_by('checked_at').values('checked_at', 'response_time_ms', 'is_up')
            data = [
                {
                    'time': c['checked_at'].strftime('%H:%M'),
                    'response': c['response_time_ms'] or 0,
                    'is_up': c['is_up'],
                }
                for c in checks
            ]
        else:
            # Use hourly aggregates for longer periods
            cutoff = now - timedelta(hours=hours)
            agg = AggregatedCheck.objects.filter(
                website=website, resolution='hourly', bucket_start__gte=cutoff
            ).order_by('bucket_start')
            data = [
                {
                    'time': a.bucket_start.strftime('%m/%d %H:%M'),
                    'response': round(a.avg_response_time_ms or 0),
                    'uptime': a.uptime_percentage,
                    'checks': a.total_checks,
                }
                for a in agg
            ]

        return Response(data)

    @action(detail=True, methods=['get'])
    def ssl_check(self, request, pk=None):
        website = self.get_object()
        if website.url.startswith('http://'):
            return Response({'hostname': urlparse(website.url).hostname, 'is_valid': False, 'error_message': 'Not an HTTPS URL'})
        from monitoring.services.checker import check_ssl
        result = check_ssl(website)
        serializer = SSLCheckSerializer(result)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def check(self, request, pk=None):
        website = self.get_object()
        from monitoring.services.checker import check_website, check_ssl
        uptime = check_website(website)
        ssl = check_ssl(website) if website.url.startswith('https://') else None
        return Response({
            'uptime': UptimeCheckSerializer(uptime).data,
            'ssl': SSLCheckSerializer(ssl).data if ssl else None,
        }, status=201)
