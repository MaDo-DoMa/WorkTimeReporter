import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "elo"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///site.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = 'localhost'
    MAIL_USE_TLS = False
    MAIL_USE_SSL = False
    MAIL_PORT = 1025
    MAIL_USERNAME = 'test@test.com'
    EMAIL_CONFIRM_SALT = os.environ.get("EMAIL_CONFIRM_SALT")
    MAIL_TIMEOUT = 10
    JWT_SECRET_KEY = "eee"