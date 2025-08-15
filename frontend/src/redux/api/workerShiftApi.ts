import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { MessageResponse } from "../../types/common"
import {
  GetWorkersShiftsResponse,
  AddWorkerShiftPayload,
  GetMyShiftsResponse,
  RangePayload,
} from "../../types/workerShift"

export const workerShiftApi = createApi({
  reducerPath: "workerShiftApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/worker-shifts`,
    credentials: "include",
  }),
  tagTypes: ["AdminWorkersShifts", "MyShifts"],
  endpoints: (builder) => ({
    getWorkersShifts: builder.query<GetWorkersShiftsResponse, RangePayload>({
      query: (params) => ({
        url: "/company",
        method: "GET",
        params,
      }),
      providesTags: ["AdminWorkersShifts"],
    }),
    addWorkerShift: builder.mutation<MessageResponse, AddWorkerShiftPayload>({
      query: (body) => ({
        url: "/create-worker-shift",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminWorkersShifts"],
    }),
    getMyShifts: builder.query<GetMyShiftsResponse, RangePayload>({
      query: (params) => ({
        url: "/my-shifts",
        method: "GET",
        params,
      }),
      providesTags: ["AdminWorkersShifts"],
    }),

    // deleteWorkerShift: builder.mutation<MessageResponse, string>({
    //   query: (id) => ({
    //     url: `/worker/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["AdminWorkersShifts"],
    // }),
    // updateWorkerShift: builder.mutation<MessageResponse, void>({
    //   query: (body) => ({
    //     url: `/${body.id}`,
    //     method: "PATCH",
    //     body,
    //   }),
    //   invalidatesTags: ["AdminWorkersShifts"],
    // }),
  }),
})

export const {
  useGetWorkersShiftsQuery,
  useAddWorkerShiftMutation,
  useGetMyShiftsQuery,
} = workerShiftApi
