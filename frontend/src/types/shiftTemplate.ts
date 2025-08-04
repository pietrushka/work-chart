export type ShiftTemplate = {
  id: string
  name: string
  position: string
  startTime: string
  endTime: string
  days: Array<number>
}

export type GetShiftTemplatesResponse = {
  items: Array<ShiftTemplate>
}

export type ShiftTemplateFormValues = Omit<ShiftTemplate, "id">

export type AddShiftTemplatePayload = ShiftTemplateFormValues

export type UpdateShiftTemplatePayload = ShiftTemplate
