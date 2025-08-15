import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  startOfDay,
  endOfDay,
  set,
} from "date-fns"
import { IRange, View, WEEK_STARTS_ON } from "../types/date"

export function getCalendarRange(view: View, currentDate: Date): IRange {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)

  const rangeStart =
    view === "month"
      ? startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON })
      : view === "week"
        ? startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON })
        : startOfDay(currentDate)
  const rangeEnd =
    view === "month"
      ? endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON })
      : view === "week"
        ? endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON })
        : endOfDay(currentDate)

  return { rangeStart, rangeEnd }
}

export function buildDateWithTime(baseDate: Date, hhmm: string): Date {
  const [hoursStr, minutesStr] = hhmm.split(":")
  const hours = Number(hoursStr ?? 0)
  const minutes = Number(minutesStr ?? 0)
  return set(baseDate, { hours, minutes, seconds: 0, milliseconds: 0 })
}
