import { Box, Button, TextField, Typography } from "@mui/material";
import { useCreateThreadMutation } from "./api/api"; // Assume you've created a mutation for thread creation
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddThreadForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [pageNumber, setPageNumber] = useState<number>(0);
  const { bookId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [createThread, { isLoading }] = useCreateThreadMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous error
    setError(null);

    try {
      // Call the mutation to create the thread
      const response = await createThread({
        title,
        page_number: pageNumber,
        book_id: Number(bookId),
      }).unwrap();
      // You can handle the success response here
      navigate(`/bookclub/${bookId}/${response.thread}`, { replace: true });
    } catch (err: any) {
      setError(err.message || "Error creating thread");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add New Thread
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Thread Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Page Number"
          type="number"
          value={pageNumber}
          onChange={(e) => setPageNumber(Number(e.target.value))}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Thread"}
        </Button>
      </form>
    </Box>
  );
};

export default AddThreadForm;
