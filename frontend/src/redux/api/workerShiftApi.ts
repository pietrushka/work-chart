import { baseApi } from "./baseApi";
import { MessageResponse } from "../../types/common";
import {
  GetWorkersShiftsResponse,
  AddWorkerShiftPayload,
  GetMyShiftsResponse,
  RangePayload,
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

    // deleteWorkerShift: builder.mutation<MessageResponse, string>({
    //   query: (id) => ({
    //     url: `/worker-shifts/worker/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["AdminWorkersShifts"],
    // }),
    // updateWorkerShift: builder.mutation<MessageResponse, void>({
    //   query: (body) => ({
    //     url: `/worker-shifts/${body.id}`,
    //     method: "PATCH",
    //     body,
    //   }),
    //   invalidatesTags: ["AdminWorkersShifts"],
    // }),
  }),
});

export const {
  useGetWorkersShiftsQuery,
  useAddWorkerShiftMutation,
  useGetMyShiftsQuery,
} = workerShiftApi;
