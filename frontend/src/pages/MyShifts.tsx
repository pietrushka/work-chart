import { useState } from "react"
import Calendar from "../components/Calendar"
import { useGetMyShiftsQuery } from "../redux/api/workerShiftApi"
import { skipToken } from "@reduxjs/toolkit/query"
import { IRange } from "../types/date"

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

  const shifts = data?.items || []
  return (
    <Calendar
      standardEvents={shifts.map((x) => ({
        label: x.template.name || "unknown",
        start_date: x.start_date,
        end_date: x.end_date,
      }))}
      setFilters={setFilters}
    />
  )
}
