import * as React from "react";
import { useParams } from "react-router-dom";
import { useGetCommentsQuery, useCreateCommentMutation } from "./api/api";

const ThreadView: React.FC = () => {
  const { threadId } = useParams<{
    bookId: string;
    threadId: string;
  }>();

  // Parse threadId into number
  const threadIdNum = threadId ? parseInt(threadId) : 0;

  const {
    data: comments,
    isLoading,
    isError,
  } = useGetCommentsQuery(threadIdNum!, {
    skip: !threadIdNum, // Skip if undefined
  });

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
      <h2>Thread View</h2>

      <div
        style={{
          marginBottom: "1rem",
          border: "1px solid #ccc",
          padding: "1rem",
          minHeight: "200px",
        }}
      >
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{comment.created_by}:</strong> {comment.body}
            </div>
          ))
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
