import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RegisterPayload, LoginPayload } from "../../types/auth"
import { MessageResponse } from "../../types/common"

type CurrentUserResponse = {
  email: string
  first_name: string
  last_name: string
  role: string
  company: {
    id: string
    name: string
  }
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/auth`,
    credentials: "include",
  }),
  tagTypes: ["CurrentUser"],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      providesTags: ["CurrentUser"],
    }),
    register: builder.mutation<MessageResponse, RegisterPayload>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<MessageResponse, LoginPayload>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentUser"],
    }),
  }),
})

export const { useGetCurrentUserQuery, useRegisterMutation, useLoginMutation } =
  authApi
