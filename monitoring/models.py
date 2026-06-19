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
    check_interval = models.PositiveIntegerField(
        _('check interval'),
        default=60,
        help_text=_('Interval in seconds between checks'),
    )
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