import logging
from django.utils import timezone
from apscheduler.schedulers.background import BackgroundScheduler

from monitoring.models import MonitoredWebsite
from monitoring.services.checker import check_website

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def run_due_checks():
    now = timezone.now()
    websites = MonitoredWebsite.objects.filter(is_active=True).select_related('user')
    for website in websites:
        last_check = website.checks.order_by('-checked_at').first()
        if last_check:
            elapsed = (now - last_check.checked_at).total_seconds()
        else:
            elapsed = float('inf')

        if elapsed >= website.check_interval:
            logger.info(f'Checking {website.name} ({website.url})')
            try:
                result = check_website(website)
                status = 'UP' if result.is_up else 'DOWN'
                logger.info(f'{website.name}: {status} ({result.status_code}) {result.response_time_ms}ms')
            except Exception as e:
                logger.error(f'Error checking {website.name}: {e}')


def start_scheduler():
    scheduler.add_job(
        run_due_checks,
        'interval',
        seconds=30,
        id='uptime_checks',
        replace_existing=True,
    )
    scheduler.start()
    logger.info('Scheduler started - checking websites every 30 seconds')