import time
import ssl
import socket
import datetime
import httpx
from urllib.parse import urlparse
from monitoring.models import UptimeCheck


def check_website(website):
    start = time.time()
    try:
        with httpx.Client(
            timeout=10.0,
            follow_redirects=True,
            verify=False,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        ) as client:
            response = client.get(website.url)
            elapsed_ms = int((time.time() - start) * 1000)
            is_up = 200 <= response.status_code < 400
            check = UptimeCheck.objects.create(
                website=website,
                status_code=response.status_code,
                response_time_ms=elapsed_ms,
                is_up=is_up,
            )
            return check
    except httpx.TimeoutException:
        elapsed_ms = int((time.time() - start) * 1000)
        return UptimeCheck.objects.create(
            website=website,
            is_up=False,
            response_time_ms=elapsed_ms,
            error_message='Timeout',
        )
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return UptimeCheck.objects.create(
            website=website,
            is_up=False,
            response_time_ms=elapsed_ms,
            error_message=str(e),
        )


def check_ssl(website):
    hostname = urlparse(website.url).hostname
    if not hostname:
        return {'hostname': website.url, 'is_valid': False, 'error_message': 'Invalid URL'}
    if website.url.startswith('http://'):
        return {'hostname': hostname, 'is_valid': False, 'error_message': 'Not an HTTPS URL'}

    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=10.0) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()

        not_after = cert.get('notAfter')
        expires_at = None
        days_remaining = None
        if not_after:
            expires_at = datetime.datetime.strptime(not_after, '%b %d %H:%M:%S %Y %Z')
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
            days_remaining = (expires_at - datetime.datetime.now(datetime.timezone.utc)).days

        issuer = dict(x for pair in cert.get('issuer', []) for x in pair)
        subject = dict(x for pair in cert.get('subject', []) for x in pair)

        return {
            'hostname': hostname,
            'is_valid': days_remaining is not None and days_remaining > 0,
            'issuer': issuer.get('organizationName', 'Unknown'),
            'subject': subject.get('commonName', hostname),
            'expires_at': expires_at.isoformat() if expires_at else None,
            'days_remaining': days_remaining,
            'error_message': None,
        }
    except ssl.SSLCertVerificationError as e:
        return {'hostname': hostname, 'is_valid': False, 'error_message': str(e)}
    except Exception as e:
        return {'hostname': hostname, 'is_valid': False, 'error_message': str(e)}