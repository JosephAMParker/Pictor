// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../Constants";

// Types
export interface Book {
  id: number;
  title: string;
  author: string;
  // Add more fields as your backend returns them
}

export interface Thread {
  id: number;
  bookId: number;
  title: string;
  page_number: number;
  created_by: string;
}

export interface Comment {
  id: number;
  body: string;
  created_by: string;
  created_at: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], void>({
      // 👈 no argument required!
      query: () => "/bookclub/books",
    }),
    getThreads: builder.query<Thread[], number>({
      query: (bookId) => `/bookclub/threads?book_id=${bookId}`,
      transformResponse: (response: Thread[]) => {
        // Sort threads by page_number in ascending order
        return response.sort((a, b) => a.page_number - b.page_number);
      },
    }),
    createThread: builder.mutation({
      query: ({ title, page_number, book_id }) => ({
        url: "/bookclub/threads",
        method: "POST",
        body: { title, page_number, book_id },
      }),
    }),
    getComments: builder.query<Comment[], number>({
      // 👈 expects a threadId (number)
      query: (threadId) => `/bookclub/comments?thread_id=${threadId}`,
    }),
    createComment: builder.mutation<
      Comment,
      { content: string; thread_id: number }
    >({
      query: ({ content, thread_id }) => ({
        url: "/bookclub/comments",
        method: "POST",
        body: { content, thread_id },
      }),
      async onQueryStarted(
        { content, thread_id },
        { dispatch, queryFulfilled }
      ) {
        // Optimistically update cache
        const patchResult = dispatch(
          api.util.updateQueryData("getComments", thread_id, (draft) => {
            draft.push({
              id: Math.random(), // temporary ID, can be anything unique
              body: content,
              created_by: "You", // 👈 or use a real username if you have it
              created_at: new Date().toISOString(),
            });
          })
        );

        try {
          await queryFulfilled; // wait for actual API response
        } catch {
          patchResult.undo(); // rollback if the API call fails
        }
      },
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetThreadsQuery,
  useGetCommentsQuery,
  useCreateThreadMutation,
  useCreateCommentMutation,
} = api;
