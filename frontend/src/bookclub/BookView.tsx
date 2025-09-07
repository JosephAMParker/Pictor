import * as React from "react";
import { useParams, Link } from "react-router-dom";

import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { useGetThreadsQuery } from "./api/api";

const BookView: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>(); // Extract bookId from the URL
  const {
    data: threads,
    isLoading,
    error,
  } = useGetThreadsQuery(Number(bookId)); // Fetch threads
  console.log(threads);
  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error fetching threads.</Typography>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Grid container justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          Contents
        </Typography>

        <Link
          to={`/bookclub/${bookId}/create`}
          style={{ textDecoration: "none" }}
        >
          <Typography variant="h6" sx={{ lineHeight: 1 }}>
            New Thread
          </Typography>
        </Link>
      </Grid>
      {/* Display threads in a grid layout */}
      <Grid container spacing={2}>
        {threads?.map((thread) => (
          <Grid item xs={12} key={thread.id}>
            <Box
              sx={{
                position: "relative", // Make the container relative
                marginBottom: "16px", // Space below for the dotted line
              }}
            >
              {/* Dotted Line Box */}
              <Box
                sx={{
                  position: "absolute",
                  top: "25%",
                  left: "25%",
                  right: 0,
                  borderBottom: "2px dotted #000",
                }}
              ></Box>

              {/* Content Grid */}
              <Grid
                container
                justifyContent="space-between"
                sx={{ position: "relative" }}
              >
                <Grid item xs={6}>
                  {/* Title and Created By */}
                  <Link
                    to={`/bookclub/${bookId}/${thread.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ lineHeight: 1, backgroundColor: "#fff" }}
                    >
                      {thread.title}
                    </Typography>
                  </Link>
                  <Typography variant="body2">{thread.created_by}</Typography>
                </Grid>
                <Grid item xs={6} alignContent="right" justifyContent="right">
                  {/* Page Number */}
                  <Typography
                    sx={{
                      backgroundColor: "#fff",
                      minWidth: "25px",
                      paddingLeft: "20px",
                    }}
                    align="right"
                    variant="body1"
                  >
                    {thread.page_number}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookView;
