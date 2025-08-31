from db import db
from datetime import datetime
from flask_admin.contrib.sqla import ModelView

from models.book import Book
from models.user import User

class Thread(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    page_number = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("book.id"), nullable=False)

    user = db.relationship("User", back_populates="threads")
    book = db.relationship("Book", back_populates="threads")
    comments = db.relationship("Comment", back_populates="thread", lazy=True)

    def __str__(self):
        return self.title 

class ThreadAdmin(ModelView):
    column_list = ["title", "page_number", "created_at", "book", "user"]
    form_columns = ["title", "page_number", "book", "user"]

    column_labels = {
        "book": "Book",
        "user": "Created By"
    }

    column_searchable_list = ["title"]

    form_ajax_refs = {
        "book": {
            "fields": ["name"]
        },
        "user": {
            "fields": ["username"]
        }
    }

