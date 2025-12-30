import { baseApi } from "./baseApi";
import {
  AddEmployeePayload,
  GetEmployeesResponse,
  UpdateEmployeePayload,
} from "../../types/employee";
import { MessageResponse } from "../../types/common";

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<GetEmployeesResponse, void>({
      query: () => ({
        url: "/users/workers",
        method: "GET",
      }),
      providesTags: ["Employees"],
    }),
    addEmployee: builder.mutation<MessageResponse, AddEmployeePayload>({
      query: (body) => ({
        url: "/users/create-worker",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employees"],
    }),
    deleteEmployee: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/users/worker/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees"],
    }),
    updateEmployee: builder.mutation<MessageResponse, UpdateEmployeePayload>({
      query: (body) => ({
        url: `/users/worker/${body.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Employees"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
} = employeeApi;
