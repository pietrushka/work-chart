import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { AddEmployeePayload, GetEmployeesResponse } from "../../types/employees"
import { MessageResponse } from "../../types/common"

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/employees`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getEmployees: builder.query<GetEmployeesResponse, void>({
      query: (body) => ({
        url: "/",
        method: "GET",
        body,
      }),
    }),
    addEmployee: builder.mutation<MessageResponse, AddEmployeePayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const { useGetEmployeesQuery, useAddEmployeeMutation } = employeesApi
