from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(50))
    password = db.Column(db.String(50))
    email = db.Column(db.String(50))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    position = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "login": self.login,
            "password": self.password,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "position": self.position,
        }


class Reports(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    work_start = db.Column(db.DateTime)
    work_end = db.Column(db.DateTime)
    project = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "work_start": self.work_start.isoformat() if self.work_start else None,
            "work_end": self.work_end.isoformat() if self.work_end else None,
            "project": self.project,
        }