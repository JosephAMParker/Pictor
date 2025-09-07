import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiUrl } from "../../Constants";

// Custom baseQuery that handles refresh tokens
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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<
      {
        id: number;
        username: string;
        access_token: string;
        refresh_token: string;
      },
      { username: string; password: string }
    >({
      query: ({ username, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { username, password },
      }),
    }),
    signup: builder.mutation<
      {
        id: number;
        username: string;
        access_token: string;
        refresh_token: string;
      },
      { username: string; password: string }
    >({
      query: ({ username, password }) => ({
        url: "/auth/signup",
        method: "POST",
        body: { username, password },
      }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
