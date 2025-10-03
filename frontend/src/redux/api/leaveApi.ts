import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  CreateLeavePayload,
  EditLeavePayload,
  GetLeavesResponse,
} from "../../types/leave"
import { MessageResponse } from "../../types/common"

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/leaves`,
    credentials: "include",
  }),
  tagTypes: ["Leaves"],
  endpoints: (builder) => ({
    getMyLeaves: builder.query<GetLeavesResponse, void>({
      query: () => ({
        url: "/my-leaves",
        method: "GET",
      }),
      providesTags: ["Leaves"],
    }),
    createLeave: builder.mutation<MessageResponse, CreateLeavePayload>({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leaves"],
    }),
    editLeave: builder.mutation<MessageResponse, EditLeavePayload>({
      query: (body) => ({
        url: `/${body.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Leaves"],
    }),
    deleteLeave: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leaves"],
    }),
  }),
})

export const {
  useGetMyLeavesQuery,
  useCreateLeaveMutation,
  useEditLeaveMutation,
  useDeleteLeaveMutation,
} = leaveApi
