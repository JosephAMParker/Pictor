// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../Constants";

// Types
export interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
}

export interface Thread {
  thread: any;
  id: number;
  bookId: number;
  title: string;
  page_number: number;
  created_by: string;
}

export interface ThreadComment {
  id: number;
  body: string;
  created_by: string;
  created_at: string;
}

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let baseQuery = fetchBaseQuery({
    baseUrl: apiUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);
  // If access token expired, try to refresh
  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return result;

    const refreshResult: any = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    }).then((res) => res.json().catch(() => null));

    if (refreshResult?.access_token) {
      // Store new token
      localStorage.setItem("access_token", refreshResult.access_token);

      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, clear tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Threads"],
  endpoints: (builder) => ({
    getUser: builder.query<
      {
        id: string;
        username: string;
      },
      void
    >({
      // 👈 no argument required!
      query: () => "/bookclub/user",
    }),
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
      providesTags: (result, error, bookId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Threads" as const, id })),
              { type: "Threads", id: `LIST-${bookId}` },
            ]
          : [{ type: "Threads", id: `LIST-${bookId}` }],
      keepUnusedDataFor: 0,
    }),

    createThread: builder.mutation<
      Thread,
      { title: string; page_number: number; book_id: number }
    >({
      query: ({ title, page_number, book_id }) => ({
        url: "/bookclub/threads",
        method: "POST",
        body: { title, page_number, book_id },
      }),
      invalidatesTags: (result, error, { book_id }) => [
        { type: "Threads", id: `LIST-${book_id}` },
      ],
    }),

    getComments: builder.query<ThreadComment[], number>({
      // 👈 expects a threadId (number)
      query: (threadId) => `/bookclub/comments?thread_id=${threadId}`,
    }),
    createComment: builder.mutation<
      ThreadComment,
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
        const now = new Date();
        const isoWithMicroseconds =
          now.toISOString().replace("Z", "") +
          now.getMilliseconds().toString().padStart(3, "0");

        const patchResult = dispatch(
          api.util.updateQueryData("getComments", thread_id, (draft) => {
            const lastId = draft.length > 0 ? draft[draft.length - 1].id : 0;
            draft.push({
              id: lastId + 1, // increment last id
              body: content,
              created_by: "You",
              created_at: isoWithMicroseconds, // matches backend style
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
  useGetUserQuery,
  useGetBooksQuery,
  useGetThreadsQuery,
  useGetCommentsQuery,
  useCreateThreadMutation,
  useCreateCommentMutation,
} = api;
