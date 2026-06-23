import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Min, Max, Count, Q, F

from monitoring.models import MonitoredWebsite, UptimeCheck, AggregatedCheck

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Aggregates raw checks into hourly/daily stats and cleans up old data'

    def handle(self, *args, **options):
        self.stdout.write('Running aggregation...')
        self.aggregate_hourly()
        self.aggregate_daily()
        self.cleanup_raw_checks()
        self.cleanup_old_aggregates()
        self.stdout.write(self.style.SUCCESS('Aggregation complete.'))

    def aggregate_hourly(self):
        now = timezone.now()
        cutoff = now - timedelta(hours=2)
        websites = MonitoredWebsite.objects.filter(is_active=True)

        for website in websites:
            # Get raw checks from the last 2 hours that haven't been aggregated yet
            # We aggregate checks from (now-2h) to (now-1h) — complete hours only
            hour_start = (now - timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            hour_end = hour_start + timedelta(hours=1)

            # Check if this hour is already aggregated
            if AggregatedCheck.objects.filter(
                website=website, resolution='hourly', bucket_start=hour_start
            ).exists():
                continue

            checks = UptimeCheck.objects.filter(
                website=website,
                checked_at__gte=hour_start,
                checked_at__lt=hour_end,
            )

            total = checks.count()
            if total == 0:
                continue

            up_count = checks.filter(is_up=True).count()
            stats = checks.filter(response_time_ms__isnull=False).aggregate(
                avg=Avg('response_time_ms'),
                min=Min('response_time_ms'),
                max=Max('response_time_ms'),
            )

            AggregatedCheck.objects.create(
                website=website,
                resolution='hourly',
                bucket_start=hour_start,
                total_checks=total,
                up_checks=up_count,
                uptime_percentage=round((up_count / total) * 100, 2),
                avg_response_time_ms=round(stats['avg'], 2) if stats['avg'] else None,
                min_response_time_ms=stats['min'],
                max_response_time_ms=stats['max'],
            )
            logger.info(f'Hourly aggregate for {website.name}: {total} checks, {round((up_count / total) * 100, 2)}% uptime')

    def aggregate_daily(self):
        now = timezone.now()
        day_start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        websites = MonitoredWebsite.objects.filter(is_active=True)

        for website in websites:
            if AggregatedCheck.objects.filter(
                website=website, resolution='daily', bucket_start=day_start
            ).exists():
                continue

            # Aggregate from hourly stats for the previous day
            hourly_checks = AggregatedCheck.objects.filter(
                website=website,
                resolution='hourly',
                bucket_start__gte=day_start,
                bucket_start__lt=day_end,
            )

            total = hourly_checks.aggregate(total=Count('id'))['total']
            if total == 0:
                continue

            # Get total_checks and up_checks across all hourly buckets
            agg = hourly_checks.aggregate(
                total_checks_sum=Count('id'),
                up_sum=Count('id'),
                avg_resp=Avg('avg_response_time_ms'),
                min_resp=Min('min_response_time_ms'),
                max_resp=Max('max_response_time_ms'),
            )

            # Calculate actual uptime from hourly uptime percentages weighted by checks
            total_checks_in_day = sum(h.total_checks for h in hourly_checks)
            up_checks_in_day = sum(h.up_checks for h in hourly_checks)

            if total_checks_in_day == 0:
                continue

            AggregatedCheck.objects.create(
                website=website,
                resolution='daily',
                bucket_start=day_start,
                total_checks=total_checks_in_day,
                up_checks=up_checks_in_day,
                uptime_percentage=round((up_checks_in_day / total_checks_in_day) * 100, 2),
                avg_response_time_ms=round(agg['avg_resp'], 2) if agg['avg_resp'] else None,
                min_response_time_ms=agg['min_resp'],
                max_response_time_ms=agg['max_resp'],
            )
            logger.info(f'Daily aggregate for {website.name}: {total_checks_in_day} checks')

    def cleanup_raw_checks(self):
        cutoff = timezone.now() - timedelta(hours=24)
        result = UptimeCheck.objects.filter(checked_at__lt=cutoff).delete()
        self.stdout.write(f'Cleaned up {result[1].get("monitoring.UptimeCheck", 0)} raw checks older than 24h')

    def cleanup_old_aggregates(self):
        cutoff = timezone.now() - timedelta(days=90)
        result = AggregatedCheck.objects.filter(
            resolution='hourly', bucket_start__lt=cutoff
        ).delete()
        self.stdout.write(f'Cleaned up {result[1].get("monitoring.AggregatedCheck", 0)} hourly aggregates older than 90d')
