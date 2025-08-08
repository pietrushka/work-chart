import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { MessageResponse } from "../../types/common"
import {
  GetWorkersShiftsResponse,
  AddWorkerShiftPayload,
} from "../../types/workerShift"

export const workerShiftApi = createApi({
  reducerPath: "workerShiftApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/worker-shifts`,
    credentials: "include",
  }),
  tagTypes: ["AdminWorkersShifts"],
  endpoints: (builder) => ({
    getWorkersShifts: builder.query<GetWorkersShiftsResponse, void>({
      query: () => ({
        url: "/company",
        method: "GET",
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

export const { useGetWorkersShiftsQuery, useAddWorkerShiftMutation } =
  workerShiftApi
