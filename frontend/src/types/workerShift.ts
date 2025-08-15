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
