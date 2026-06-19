import logging
from django.core.management.base import BaseCommand
from monitoring.services.scheduler import start_scheduler, scheduler

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Starts the APScheduler to periodically check website uptime'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting scheduler...'))
        start_scheduler()
        self.stdout.write(self.style.SUCCESS('Scheduler is running. Press Ctrl+C to stop.'))

        try:
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS('Scheduler stopped.'))