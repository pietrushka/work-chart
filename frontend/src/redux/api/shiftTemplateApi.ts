import { baseApi } from "./baseApi";
import { MessageResponse } from "../../types/common";
import {
  AddShiftTemplatePayload,
  GetShiftTemplatesResponse,
  UpdateShiftTemplatePayload,
} from "../../types/shiftTemplate";

export const shiftTemplateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShiftTemplates: builder.query<GetShiftTemplatesResponse, void>({
      query: (body) => ({
        url: "/shift-templates/company",
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
        url: "/shift-templates/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShiftTemplates"],
    }),
    deleteShiftTemplate: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/shift-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShiftTemplates"],
    }),
    updateShiftTemplate: builder.mutation<
      MessageResponse,
      UpdateShiftTemplatePayload
    >({
      query: (body) => ({
        url: `/shift-templates/${body.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ShiftTemplates"],
    }),
  }),
});

export const {
  useGetShiftTemplatesQuery,
  useAddShiftTemplateMutation,
  useDeleteShiftTemplateMutation,
  useUpdateShiftTemplateMutation,
} = shiftTemplateApi;
