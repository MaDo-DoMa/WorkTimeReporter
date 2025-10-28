import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "elo"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///site.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Mail configuration
    MAIL_SERVER = 'localhost'
    MAIL_USE_TLS = False
    MAIL_USE_SSL = False
    MAIL_PORT = 1025
    MAIL_USERNAME = 'test@test.com'
    EMAIL_CONFIRM_SALT = os.environ.get("EMAIL_CONFIRM_SALT") or "email-confirm-salt"
    MAIL_TIMEOUT = 10

    # Session configuration
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    PERMANENT_SESSION_LIFETIME = 3600  # 1 hour