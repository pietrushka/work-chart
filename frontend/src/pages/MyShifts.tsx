import { useState } from "react"
import Calendar from "../components/Calendar"
import { useGetMyShiftsQuery } from "../redux/api/workerShiftApi"
import { skipToken } from "@reduxjs/toolkit/query"
import { IRange } from "../types/date"
import computeShiftEvents from "../utils/computeShiftEvents"

export default function MyShifts() {
  const [filters, setFilters] = useState<IRange>()
  const { data } = useGetMyShiftsQuery(
    filters
      ? {
          range_start: filters.rangeStart.toISOString(),
          range_end: filters.rangeEnd.toISOString(),
        }
      : skipToken,
  )

  const workerShifts = data?.items || []

  const eventsByDate = computeShiftEvents(workerShifts)

  return <Calendar eventsByDate={eventsByDate} setFilters={setFilters} />
}
