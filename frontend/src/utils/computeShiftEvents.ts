import { format } from "date-fns"
import { CalendarEvent, CalendarEvents } from "../components/Calendar"
import { WorkerShift } from "../types/workerShift"

export default function computeShiftEvents(
  workerShifts: Array<WorkerShift>,
): CalendarEvents {
  const calendarEvents: CalendarEvents = workerShifts.reduce<
    Record<string, Array<CalendarEvent>>
  >((acc, workerShift) => {
    const { start_date, end_date } = workerShift
    const start = new Date(start_date)
    const end = new Date(end_date)
    const key = format(start, "yyyy-MM-dd")

    if (!acc[key]) {
      acc[key] = []
    }

    acc[key].push({
      label: "Shift",
      timeLabel: `${start.toLocaleTimeString()}-${end.toLocaleTimeString()}`,
      startDateTime: start,
      endDateTime: new Date(end_date),
      onClick: () => {},
    })

    return acc
  }, {})
  return calendarEvents
}
