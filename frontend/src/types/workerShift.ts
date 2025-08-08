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
