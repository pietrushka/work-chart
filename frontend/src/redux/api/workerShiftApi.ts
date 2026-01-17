import { baseApi } from "./baseApi";
import { MessageResponse } from "../../types/common";
import {
  GetWorkersShiftsResponse,
  AddWorkerShiftPayload,
  GetMyShiftsResponse,
  RangePayload,
  AutoAssignPayload,
  GetAssignmentSuggestionsResponse,
  ClearShiftsResponse,
} from "../../types/workerShift";

export const workerShiftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkersShifts: builder.query<GetWorkersShiftsResponse, RangePayload>({
      query: (params) => ({
        url: "/worker-shifts/company",
        method: "GET",
        params,
      }),
      providesTags: ["AdminWorkersShifts"],
    }),
    addWorkerShift: builder.mutation<MessageResponse, AddWorkerShiftPayload>({
      query: (body) => ({
        url: "/worker-shifts/create-worker-shift",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminWorkersShifts"],
    }),
    getMyShifts: builder.query<GetMyShiftsResponse, RangePayload>({
      query: (params) => ({
        url: "/worker-shifts/my-shifts",
        method: "GET",
        params,
      }),
      providesTags: ["AdminWorkersShifts"],
    }),

    autoAssign: builder.mutation<
      GetAssignmentSuggestionsResponse,
      AutoAssignPayload
    >({
      query: (body) => ({
        url: "/worker-shifts/auto-assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AssignmentSuggestions"],
    }),
    getAssignmentSuggestions: builder.query<
      GetAssignmentSuggestionsResponse,
      void
    >({
      query: () => ({
        url: "/worker-shifts/suggestions",
        method: "GET",
      }),
      providesTags: ["AssignmentSuggestions"],
    }),
    acceptSuggestions: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/worker-shifts/suggestions/accept",
        method: "POST",
      }),
      invalidatesTags: ["AssignmentSuggestions", "AdminWorkersShifts"],
    }),
    declineSuggestions: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/worker-shifts/suggestions",
        method: "DELETE",
      }),
      invalidatesTags: ["AssignmentSuggestions"],
    }),
    clearShifts: builder.mutation<ClearShiftsResponse, RangePayload>({
      query: (params) => ({
        url: "/worker-shifts/clear",
        method: "DELETE",
        params,
      }),
      invalidatesTags: ["AdminWorkersShifts"],
    }),
  }),
});

export const {
  useGetWorkersShiftsQuery,
  useAddWorkerShiftMutation,
  useGetMyShiftsQuery,
  useAutoAssignMutation,
  useGetAssignmentSuggestionsQuery,
  useAcceptSuggestionsMutation,
  useDeclineSuggestionsMutation,
  useClearShiftsMutation,
} = workerShiftApi;
