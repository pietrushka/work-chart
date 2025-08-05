import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  AddEmployeePayload,
  GetEmployeesResponse,
  UpdateEmployeePayload,
} from "../../types/employee"
import { MessageResponse } from "../../types/common"

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/users`,
    credentials: "include",
  }),
  tagTypes: ["Employees"],
  endpoints: (builder) => ({
    getEmployees: builder.query<GetEmployeesResponse, void>({
      query: () => ({
        url: "/workers",
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    addEmployee: builder.mutation<MessageResponse, AddEmployeePayload>({
      query: (body) => ({
        url: "/create-worker",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employees"],
    }),
    deleteEmployee: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/worker/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees"],
    }),
    updateEmployee: builder.mutation<MessageResponse, UpdateEmployeePayload>({
      query: (body) => ({
        url: `/worker/${body.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Employees"],
    }),
  }),
})

export const {
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
} = employeeApi
