import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class MonitoredWebsite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='websites',
    )
    name = models.CharField(_('name'), max_length=255)
    url = models.URLField(_('URL'))
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('monitored website')
        verbose_name_plural = _('monitored websites')
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class UptimeCheck(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    website = models.ForeignKey(
        MonitoredWebsite,
        on_delete=models.CASCADE,
        related_name='checks',
    )
    status_code = models.PositiveIntegerField(_('status code'), null=True, blank=True)
    response_time_ms = models.PositiveIntegerField(_('response time (ms)'), null=True, blank=True)
    is_up = models.BooleanField(_('is up'))
    error_message = models.TextField(_('error message'), blank=True, null=True)
    checked_at = models.DateTimeField(_('checked at'), auto_now_add=True)

    class Meta:
        verbose_name = _('uptime check')
        verbose_name_plural = _('uptime checks')
        ordering = ['-checked_at']
        indexes = [
            models.Index(fields=['website', '-checked_at']),
        ]

    def __str__(self):
        status = 'UP' if self.is_up else 'DOWN'
        return f'{self.website.name} - {status} @ {self.checked_at}'


class AggregatedCheck(models.Model):
    RESOLUTION_CHOICES = [
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    website = models.ForeignKey(
        MonitoredWebsite,
        on_delete=models.CASCADE,
        related_name='aggregated_checks',
    )
    resolution = models.CharField(max_length=10, choices=RESOLUTION_CHOICES)
    bucket_start = models.DateTimeField()
    total_checks = models.PositiveIntegerField(default=0)
    up_checks = models.PositiveIntegerField(default=0)
    uptime_percentage = models.FloatField(default=0.0)
    avg_response_time_ms = models.FloatField(null=True, blank=True)
    min_response_time_ms = models.PositiveIntegerField(null=True, blank=True)
    max_response_time_ms = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = _('aggregated check')
        verbose_name_plural = _('aggregated checks')
        ordering = ['-bucket_start']
        unique_together = ['website', 'resolution', 'bucket_start']
        indexes = [
            models.Index(fields=['website', 'resolution', '-bucket_start']),
        ]

    def __str__(self):
        return f'{self.website.name} - {self.resolution} @ {self.bucket_start}'