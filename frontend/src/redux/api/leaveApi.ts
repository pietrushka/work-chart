import { baseApi } from "./baseApi";
import {
  CreateLeavePayload,
  EditLeavePayload,
  GetLeavesResponse,
} from "../../types/leave";
import { MessageResponse } from "../../types/common";

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLeaves: builder.query<GetLeavesResponse, void>({
      query: () => ({
        url: "/leaves/my-leaves",
        method: "GET",
      }),
      providesTags: ["Leaves"],
    }),
    createLeave: builder.mutation<MessageResponse, CreateLeavePayload>({
      query: (body) => ({
        url: "/leaves/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leaves"],
    }),
    editLeave: builder.mutation<MessageResponse, EditLeavePayload>({
      query: (body) => ({
        url: `/leaves/${body.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Leaves"],
    }),
    deleteLeave: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/leaves/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leaves"],
    }),
  }),
});

export const {
  useGetMyLeavesQuery,
  useCreateLeaveMutation,
  useEditLeaveMutation,
  useDeleteLeaveMutation,
} = leaveApi;
