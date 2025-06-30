from .settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}


class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None


MIGRATION_MODULES = DisableMigrations()

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# # Optional: clean DRF testing config
# REST_FRAMEWORK = {
#     **REST_FRAMEWORK,
#     "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
#     "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
# }

# # Optional: disable noisy logging
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': True,
# }
