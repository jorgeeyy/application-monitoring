import logging
from apscheduler.schedulers.background import BackgroundScheduler

from monitoring.models import MonitoredWebsite
from monitoring.services.checker import check_website

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def check_all_websites():
    websites = MonitoredWebsite.objects.filter(is_active=True)
    for website in websites:
        logger.info(f'Checking {website.name} ({website.url})')
        try:
            result = check_website(website)
            status = 'UP' if result.is_up else 'DOWN'
            logger.info(f'{website.name}: {status} ({result.status_code}) {result.response_time_ms}ms')
        except Exception as e:
            logger.error(f'Error checking {website.name}: {e}')


def run_aggregation():
    from django.core.management import call_command
    logger.info('Running aggregation...')
    try:
        call_command('aggregate_checks')
    except Exception as e:
        logger.error(f'Aggregation error: {e}')


def start_scheduler():
    scheduler.add_job(
        check_all_websites,
        'interval',
        seconds=60,
        id='uptime_checks',
        replace_existing=True,
    )
    scheduler.add_job(
        run_aggregation,
        'interval',
        minutes=5,
        id='aggregate_checks',
        replace_existing=True,
    )
    scheduler.start()
    logger.info('Scheduler started - checks every 60s, aggregation every 5min')
