import os
from django.apps import AppConfig


class MonitoringConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'monitoring'
    verbose_name = 'Website Monitoring'

    def ready(self):
        if os.environ.get('RUN_MAIN') or os.environ.get('RUN_SCHEDULER'):
            from monitoring.services.scheduler import start_scheduler
            start_scheduler()
