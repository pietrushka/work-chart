import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { MessageResponse } from "../../types/common"
import {
  AddShiftTemplatePayload,
  GetShiftTemplatesResponse,
  UpdateShiftTemplatePayload,
} from "../../types/shiftTemplate"

export const shiftTemplateApi = createApi({
  reducerPath: "shiftTemplatesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/shift-templates`,
    credentials: "include",
  }),
  tagTypes: ["ShiftTemplates"],
  endpoints: (builder) => ({
    getShiftTemplates: builder.query<GetShiftTemplatesResponse, void>({
      query: (body) => ({
        url: "/company",
        method: "GET",
        body,
      }),
      providesTags: ["ShiftTemplates"],
    }),
    addShiftTemplate: builder.mutation<
      MessageResponse,
      AddShiftTemplatePayload
    >({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShiftTemplates"],
    }),
    deleteShiftTemplate: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShiftTemplates"],
    }),
    updateShiftTemplate: builder.mutation<
      MessageResponse,
      UpdateShiftTemplatePayload
    >({
      query: (body) => ({
        url: `/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ShiftTemplates"],
    }),
  }),
})

export const {
  useGetShiftTemplatesQuery,
  useAddShiftTemplateMutation,
  useDeleteShiftTemplateMutation,
  useUpdateShiftTemplateMutation,
} = shiftTemplateApi
