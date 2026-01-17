export type ShiftTemplate = {
  id: string
  company_id: string
  name: string
  position: string
  startTime: string
  endTime: string
  days: Array<number>
  startDate?: string
  endDate?: string
}

export type GetShiftTemplatesResponse = {
  items: Array<ShiftTemplate>
}

export type ShiftTemplateFormValues = Omit<ShiftTemplate, "id" | "company_id">

export type AddShiftTemplatePayload = ShiftTemplateFormValues

export type UpdateShiftTemplatePayload = Omit<ShiftTemplate, "company_id">
