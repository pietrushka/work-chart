import { Dispatch, SetStateAction, useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameMonth,
  isToday,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  startOfDay,
  endOfDay,
  set,
  isAfter,
} from "date-fns"
import { Box, IconButton, Typography, ButtonGroup, Button } from "@mui/material"
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import ChevronRight from "@mui/icons-material/ChevronRight"

// Week starts on Monday
const WEEK_STARTS_ON = 1 as const

type View = "month" | "week" | "day"

type StandardEvent = {
  label: string
  start_date: string
  end_date: string
}
type RecurringEvent = {
  label: string
  start_time: string
  end_time: string
  weekDays: Array<number>
  onClick: (event: CalendarEvent) => void
}

type CalendarProps = {
  standardEvents?: Array<StandardEvent>
  recurringEvents?: Array<RecurringEvent>
}

export type CalendarEvent = {
  label: string
  timeLabel: string
  startDateTime: Date
  endDateTime: Date
  onClick?: (event: CalendarEvent) => void
}

function getDayLabels(view: View, currentDate: Date) {
  const headerStart = startOfWeek(currentDate, {
    weekStartsOn: WEEK_STARTS_ON,
  })
  const labels: string[] =
    view === "day"
      ? [format(currentDate, "EEE")]
      : Array.from({ length: 7 }).map((_, idx) =>
          format(addDays(headerStart, idx), "EEE"),
        )

  return labels
}

function getCalendarWeeks(
  view: View,
  currentDate: Date,
  rangeStart: Date,
  rangeEnd: Date,
) {
  const allWeeks: Date[][] = []
  if (view === "day") {
    allWeeks.push([currentDate])
  } else {
    let day = rangeStart
    while (day <= rangeEnd) {
      const week: Date[] = []
      for (let i = 0; i < 7; i += 1) {
        week.push(day)
        day = addDays(day, 1)
      }
      allWeeks.push(week)
    }
  }
  return allWeeks
}

function getCalendarRange(view: View, currentDate: Date) {
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

function buildDateWithTime(baseDate: Date, hhmm: string): Date {
  const [hoursStr, minutesStr] = hhmm.split(":")
  const hours = Number(hoursStr ?? 0)
  const minutes = Number(minutesStr ?? 0)
  return set(baseDate, { hours, minutes, seconds: 0, milliseconds: 0 })
}

function computeCalendarEvents(
  standardEvents: Array<StandardEvent>,
  recurringEvents: Array<RecurringEvent>,
  rangeStart: Date,
  rangeEnd: Date,
) {
  const workerShiftEventsByDate = standardEvents.reduce<
    Record<string, CalendarEvent[]>
  >((acc, ws) => {
    if (!ws.start_date || !ws.end_date) return acc
    const start = parseISO(ws.start_date)
    const end = parseISO(ws.end_date)
    if (!isValid(start) || !isValid(end)) return acc
    const key = format(start, "yyyy-MM-dd")
    const label = "Shift"
    const timeLabel = `${format(start, "HH:mm")}-${format(end, "HH:mm")}`
    const event: CalendarEvent = {
      label,
      timeLabel,
      startDateTime: start,
      endDateTime: end,
    }
    acc[key] = acc[key] ? [...acc[key], event] : [event]
    return acc
  }, {})

  const eventsByDate: Record<string, CalendarEvent[]> = {
    ...workerShiftEventsByDate,
  }

  if (recurringEvents?.length) {
    // Fill in recurring template events across the displayed calendar range
    let d = rangeStart
    while (d <= rangeEnd) {
      const dow = getDay(d) // 0 (Sun) - 6 (Sat)
      const key = format(d, "yyyy-MM-dd")
      for (const tpl of recurringEvents) {
        if (tpl.weekDays.includes(dow)) {
          const startDateTime = buildDateWithTime(d, tpl.start_time)
          let endDateTime = buildDateWithTime(d, tpl.end_time)
          if (!isAfter(endDateTime, startDateTime)) {
            endDateTime = addDays(endDateTime, 1)
          }

          const event: CalendarEvent = {
            label: tpl.label,
            timeLabel: `${tpl.start_time}-${tpl.end_time}`,
            onClick: tpl.onClick,
            startDateTime,
            endDateTime,
          }
          eventsByDate[key] = eventsByDate[key]
            ? [...eventsByDate[key], event]
            : [event]
        }
      }
      d = addDays(d, 1)
    }
  }

  return eventsByDate
}

export default function Calendar({
  standardEvents,
  recurringEvents,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<View>("month")

  const { weeks, dayLabels, eventsByDate } = useMemo(() => {
    const dayLabels = getDayLabels(view, currentDate)
    const { rangeStart, rangeEnd } = getCalendarRange(view, currentDate)
    const weeks = getCalendarWeeks(view, currentDate, rangeStart, rangeEnd)
    const eventsByDate = computeCalendarEvents(
      standardEvents || [],
      recurringEvents || [],
      rangeStart,
      rangeEnd,
    )

    return { weeks, dayLabels, eventsByDate }
  }, [currentDate, view, standardEvents, recurringEvents])

  return (
    <Box sx={{ width: "100%", maxWidth: 720, mx: "auto" }}>
      <CalendarControls
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
      />

      <DayLabels view={view} dayLabels={dayLabels} />

      {/* Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            view === "day" ? "repeat(1, 1fr)" : "repeat(7, 1fr)",
          gap: 0.5,
        }}
      >
        {weeks.map((week, wIdx) => (
          <Box key={`wk-${wIdx}`} sx={{ display: "contents" }}>
            {week.map((day) => (
              <DayCell
                view={view}
                day={day}
                currentDate={currentDate}
                eventsByDate={eventsByDate}
                wIdx={wIdx}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function DayCell({
  view,
  day,
  currentDate,
  eventsByDate,
  wIdx,
}: {
  view: View
  day: Date
  currentDate: Date
  eventsByDate: Record<string, Array<CalendarEvent>>
  wIdx: number
}) {
  const outside = view === "month" ? !isSameMonth(day, currentDate) : false
  const today = isToday(day)
  const key = format(day, "yyyy-MM-dd")
  const events = eventsByDate[key] || []

  return (
    <Box
      // TODO is wIdx needed here
      key={`${wIdx}-${key}`}
      sx={{
        aspectRatio: view === "day" ? "auto" : "1 / 1",
        minHeight: view === "day" ? 180 : undefined,
        p: 0.75,
        borderRadius: 1,
        border: "1px solid",
        borderColor: today ? "primary.main" : "divider",
        bgcolor: today ? "primary.light" : "background.paper",
        opacity: outside ? 0.45 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        fontSize: 14,
        overflow: "hidden",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {format(day, "d")}
      </Typography>
      <Box
        sx={{
          mt: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        {events.map((ev) => (
          <Box
            // key={ev.id}
            sx={{
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              borderLeft: "3px solid",
              //   borderLeftColor:
              //     ev.kind === "template" ? "info.main" : "success.main",
              bgcolor: "action.hover",
              fontSize: 12,
              lineHeight: 1.2,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
            title={`${ev.label} ${ev.timeLabel}`}
            onClick={() => ev.onClick?.(ev)}
          >
            {ev.label} {ev.timeLabel}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function DayLabels({
  view,
  dayLabels,
}: {
  view: View
  dayLabels: Array<string>
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          view === "day" ? "repeat(1, 1fr)" : "repeat(7, 1fr)",
        gap: 0.5,
        mb: 0.5,
        px: 0.5,
      }}
    >
      {dayLabels.map((lbl) => (
        <Box
          key={lbl}
          sx={{ textAlign: "center", color: "text.secondary", fontSize: 13 }}
        >
          {lbl}
        </Box>
      ))}
    </Box>
  )
}

type CalendarControlsProps = {
  currentDate: Date
  setCurrentDate: Dispatch<SetStateAction<Date>>
  view: View
  setView: Dispatch<SetStateAction<View>>
}

function CalendarControls({
  currentDate,
  setCurrentDate,
  view,
  setView,
}: CalendarControlsProps) {
  const goPrev = () =>
    setCurrentDate((d) =>
      view === "month"
        ? subMonths(d, 1)
        : addDays(d, view === "week" ? -7 : -1),
    )
  const goNext = () =>
    setCurrentDate((d) =>
      view === "month" ? addMonths(d, 1) : addDays(d, view === "week" ? 7 : 1),
    )
  const goToday = () => setCurrentDate(new Date())

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton aria-label="Previous month" onClick={goPrev} size="small">
          <ChevronLeft />
        </IconButton>
        <IconButton aria-label="Next month" onClick={goNext} size="small">
          <ChevronRight />
        </IconButton>
      </Box>

      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
        {view === "month" && format(currentDate, "MMMM yyyy")}
        {view === "week" &&
          `${format(startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), "d MMM")} – ${format(endOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON }), "d MMM yyyy")}`}
        {view === "day" && format(currentDate, "EEE, d MMM yyyy")}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ButtonGroup size="small" variant="outlined">
          <Button
            variant={view === "month" ? "contained" : "outlined"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "contained" : "outlined"}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            variant={view === "day" ? "contained" : "outlined"}
            onClick={() => setView("day")}
          >
            Day
          </Button>
        </ButtonGroup>
        <IconButton aria-label="Today" onClick={goToday} size="small">
          <Typography variant="button">Today</Typography>
        </IconButton>
      </Box>
    </Box>
  )
}
