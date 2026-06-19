"""
Django development settings for application-monitoring project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0').split(',')

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

