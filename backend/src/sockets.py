# sockets.py
from flask_socketio import SocketIO, join_room, leave_room, emit

socketio = SocketIO(cors_allowed_origins="*")  # exported for app.py to init


def register_socket_events(app):
    @socketio.on("join")
    def on_join(data):
        print("joinging", data)
        username = data.get("username", "UnknownUser")
        thread_id = data["thread_id"]
        join_room(thread_id)
        emit("status", {"msg": f"{username} joined thread {thread_id}"}, room=thread_id)

    @socketio.on("leave")
    def on_leave(data):
        username = data.get("username", "UnknownUser")
        thread_id = data.get("thread_id")
        if thread_id is None:
            print("No thread_id provided on leave")
            return
        leave_room(thread_id)
        emit("status", {"msg": f"{username} left thread {thread_id}"}, room=thread_id)

    @socketio.on("comment")
    def on_comment(data):
        thread_id = data["thread_id"]
        comment = data["comment"]
        emit("new_comment", {"comment": comment}, room=thread_id)
