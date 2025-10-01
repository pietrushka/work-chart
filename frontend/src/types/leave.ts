export type Leave = {
  id: string
  user_id: string
  company_id: string
  start_date: string
  end_date: string
}

export type CreateLeavePayload = {
  start_date: string
  end_date: string
}

export type EditLeavePayload = {
  id: string
  start_date?: string
  end_date?: string
}

export type GetLeavesResponse = {
  status: string
  items: Leave[]
}
