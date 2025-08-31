# routes/book.py
from flask import Blueprint, jsonify, request
from models.user import User
from models.book import Book
from models.thread import Thread
from models.comment import Comment
from db import db
from flask_jwt_extended import jwt_required, get_jwt_identity

book_bp = Blueprint("bookclub", __name__)
from flask import Flask

app = Flask(__name__)


@book_bp.route("/books", methods=["GET"])
def get_books():
    books = Book.query.all()  # Fetch all books from the database
    books_data = [
        {"id": book.id, "name": book.name, "cover": book.cover} for book in books
    ]  # Convert to list of dicts
    return jsonify(books_data)


# GET /bookclub/book/threads?book_id=<id>
@book_bp.route("/threads", methods=["GET"])
def get_threads():
    book_id = request.args.get("book_id")
    if not book_id:
        return jsonify({"error": "book_id is required"}), 400

    threads = Thread.query.filter_by(book_id=book_id).all()
    threads_data = [
        {
            "id": thread.id,
            "title": thread.title,
            "created_by": thread.user.username,
            "page_number": thread.page_number,
        }
        for thread in threads
    ]
    return jsonify(threads_data)


@book_bp.route("/threads", methods=["POST"])
@jwt_required()  # Ensure the user is authenticated
def create_thread():
    # Get the current user's ID from the JWT token
    current_user_id = get_jwt_identity()
    # Get data from request body
    data = request.get_json()
    title = data.get("title")
    page_number = data.get("page_number")
    book_id = data.get("book_id")

    if not title or not page_number or not book_id:
        return jsonify({"message": "Missing required fields"}), 400

    # Create the new thread
    new_thread = Thread(
        title=title,
        page_number=page_number,
        user_id=current_user_id,  # Set the user_id to the current user's ID
        book_id=book_id,
    )

    # Add to database
    db.session.add(new_thread)
    db.session.commit()

    return (
        jsonify({"message": "Thread created successfully", "thread": new_thread.id}),
        201,
    )


# GET /bookclub/book/comments?thread_id=<id>
@book_bp.route("/comments", methods=["GET"])
def get_comments():
    thread_id = request.args.get("thread_id")
    if not thread_id:
        return jsonify({"error": "thread_id is required"}), 400

    comments = (
        Comment.query.filter_by(thread_id=thread_id).order_by(Comment.created_at).all()
    )
    comments_data = [
        {
            "id": comment.id,
            "body": comment.body,
            "created_by": comment.user.username,
            "created_at": comment.created_at.isoformat(),
        }
        for comment in comments
    ]
    return jsonify(comments_data)


@book_bp.route("/comments", methods=["POST"])
@jwt_required()  # Ensure the user is authenticated
def create_comment():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    body = data.get("content")
    thread_id = data.get("thread_id")

    if not body or not thread_id:
        return jsonify({"message": "Missing required fields"}), 400

    # Get the username of the user who is posting the comment
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Create the comment
    new_comment = Comment(
        body=body,
        created_by=current_user_id,
        thread_id=thread_id,
    )

    db.session.add(new_comment)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Comment created successfully",
                "comment": {
                    "id": new_comment.id,
                    "body": new_comment.body,
                    "created_by": new_comment.created_by,
                    "created_at": new_comment.created_at.isoformat(),
                },
            }
        ),
        201,
    )
