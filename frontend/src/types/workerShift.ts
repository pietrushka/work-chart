import { ShiftTemplate } from "./shiftTemplate"

export type WorkerShift = {
  id: string
  template_id: string
  worker_id: string
  start_date: string
  end_date: string
}

export type GetWorkersShiftsResponse = {
  items: WorkerShift[]
}

export type AddWorkerShiftPayload = {
  template_id: string
  worker_id: string
  start_date: string
  end_date: string
}

export type RangePayload = {
  range_start: string
  range_end: string
}

export type GetMyShiftsResponse = {
  items: (WorkerShift & { template: ShiftTemplate })[]
}

export type AssignmentSuggestion = {
  id: string
  worker_id: string
  company_id: string
  template_id: string
  start_date: string
  end_date: string
  created_at: string
}

export type GetAssignmentSuggestionsResponse = {
  items: AssignmentSuggestion[]
}

export type AutoAssignPayload = {
  range_start: string
  range_end: string
  overwrite_shifts: boolean
}

export type ClearShiftsResponse = {
  status: string
  count: number
}
