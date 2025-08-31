from db import db
from datetime import datetime

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    cover = db.Column(db.String(255))  # URL to cover image
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    threads = db.relationship("Thread", back_populates="book", lazy=True)

    def __str__(self):
        return self.name
