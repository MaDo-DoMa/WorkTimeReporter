from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Zwiększona długość dla bcrypt
    email = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    position = db.Column(db.String(50))
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "login": self.login,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "position": self.position,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Reports(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    work_start = db.Column(db.DateTime, nullable=False)
    work_end = db.Column(db.DateTime)
    project = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacja z User
    user = db.relationship('User', backref=db.backref('reports', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "work_start": self.work_start.isoformat() if self.work_start else None,
            "work_end": self.work_end.isoformat() if self.work_end else None,
            "project": self.project,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }