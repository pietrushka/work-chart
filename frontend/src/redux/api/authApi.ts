import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RegisterPayload, LoginPayload } from "../../types/auth"
import { MessageResponse } from "../../types/common"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/auth`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
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
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation } = authApi
