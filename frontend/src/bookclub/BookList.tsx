import * as React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useGetBooksQuery } from "./api/api";

const BookList: React.FC = () => {
  const { data: books, isLoading, error } = useGetBooksQuery();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error loading books.</div>;
  }

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {books?.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4}>
            <Card
              component={Link}
              to={`/bookclub/${book.id}`}
              style={{ textDecoration: "none" }}
            >
              <CardMedia
                component="img"
                height="600"
                image={book.cover}
                alt={book.title}
              />
              <CardContent>
                <Typography variant="h6" component="div" noWrap>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {book.author}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookList;
