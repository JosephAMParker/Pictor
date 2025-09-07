import * as React from "react";
import { useParams } from "react-router-dom";
import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useGetThreadsQuery,
  useGetUserQuery,
  ThreadComment,
} from "./api/api";
import { socket } from "./socket/socket";

const ThreadView: React.FC = () => {
  const { bookId, threadId } = useParams<{
    bookId: string;
    threadId: string;
  }>();

  // Parse threadId into number
  const threadIdNum = threadId ? parseInt(threadId) : 0;
  const { data: threads } = useGetThreadsQuery(Number(bookId));
  const thread = threads?.find((t) => t.id.toString() === threadId);
  const { data: user } = useGetUserQuery();
  const username = user?.username;
  const {
    data: comments,
    isLoading,
    isError,
  } = useGetCommentsQuery(threadIdNum!, {
    skip: !threadIdNum, // Skip if undefined
  });

  const [liveComments, setLiveComments] = React.useState<ThreadComment[]>([]);

  const mergedComments = React.useMemo(() => {
    if (!comments) return liveComments;

    // Combine API comments + live comments
    const combined = [...comments, ...liveComments];

    // Sort by id ascending
    return combined.sort((a, b) => a.id - b.id);
  }, [comments, liveComments]);

  // Join the thread room and listen for updates
  React.useEffect(() => {
    socket.emit("join", { username, thread_id: threadId });

    socket.on("comment_added", (comment: ThreadComment) => {
      if (comment.created_by !== username) {
        setLiveComments((prev) => [...prev, comment]);
      }
    });

    return () => {
      socket.emit("leave", { username, thread_id: threadId });
      socket.off("comment_added");
    };
  }, [threadId, username]);

  const [newComment, setNewComment] = React.useState("");

  // We'll add this mutation hook soon when we define addComment
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment({
        content: newComment,
        thread_id: threadIdNum,
      }).unwrap();

      setNewComment("");
      // Ideally you'd also refetch comments here if your RTK Query setup doesn't do it automatically
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  if (isLoading) return <div>Loading comments...</div>;
  if (isError) return <div>Failed to load comments.</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{thread?.title}</h2>

      <div
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          minHeight: "200px",
        }}
      >
        {mergedComments && mergedComments.length > 0 ? (
          mergedComments.map((comment, index) => {
            const prevComment = mergedComments[index - 1];
            const showName =
              !prevComment || prevComment.created_by !== comment.created_by;
            const displayName =
              comment.created_by === username ? "You" : comment.created_by;
            return (
              <>
                {showName && <br />}
                <span key={comment.id} style={{ marginBottom: "0.5rem" }}>
                  {showName && <strong>{displayName}</strong>}
                  {showName ? `: ${comment.body}.` : ` ${comment.body}.`}
                </span>
              </>
            );
          })
        ) : (
          <div>No comments yet.</div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          style={{ width: "100%", marginBottom: "0.5rem" }}
          placeholder="Write your comment..."
        />
        <button type="submit" disabled={isPosting || !newComment.trim()}>
          {isPosting ? "Posting..." : "Add Comment"}
        </button>
      </form>
    </div>
  );
};

export default ThreadView;
