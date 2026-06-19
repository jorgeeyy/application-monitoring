"""
Django development settings for application-monitoring project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

