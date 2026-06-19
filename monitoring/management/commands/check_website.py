from django.core.management.base import BaseCommand
from monitoring.models import MonitoredWebsite
from monitoring.services.checker import check_website


class Command(BaseCommand):
    help = 'Manually check a website and store the result'

    def add_arguments(self, parser):
        parser.add_argument('website_id', type=str, help='UUID of the website to check')

    def handle(self, *args, **options):
        website_id = options['website_id']
        try:
            website = MonitoredWebsite.objects.get(id=website_id)
        except MonitoredWebsite.DoesNotExist:
            self.stderr.write(self.style.ERROR(f'Website with id={website_id} not found'))
            return

        self.stdout.write(f'Checking {website.name} ({website.url})...')
        result = check_website(website)

        if result.is_up:
            self.stdout.write(self.style.SUCCESS(
                f'UP - {result.status_code} ({result.response_time_ms}ms)'
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f'DOWN - {result.error_message or result.status_code} ({result.response_time_ms}ms)'
            ))