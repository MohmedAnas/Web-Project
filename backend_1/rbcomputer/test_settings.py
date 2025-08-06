"""
Test settings for RB Computer API
Optimized for fast testing with in-memory database
"""

from .settings import *

# Use in-memory SQLite for faster tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
        'OPTIONS': {
            'timeout': 20,
        }
    }
}

# Disable migrations for faster test setup
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable logging during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
    },
}

# Disable email sending during tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Disable caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Test-specific settings
SECRET_KEY = 'test-secret-key-for-testing-only'
DEBUG = False
ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']

# Disable rate limiting for tests
RATE_LIMITING_ENABLED = False

# Media files for tests
MEDIA_ROOT = '/tmp/rb_computer_test_media'

# Static files for tests
STATIC_ROOT = '/tmp/rb_computer_test_static'
