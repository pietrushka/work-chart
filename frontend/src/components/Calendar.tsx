import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfWeek,
  subMonths,
} from "date-fns"
import { Box, IconButton, Typography, ButtonGroup, Button } from "@mui/material"
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import ChevronRight from "@mui/icons-material/ChevronRight"
import { IRange, View, WEEK_STARTS_ON } from "../types/date"
import { getCalendarRange } from "../utils/dateHelpers"

// TODO fix self-referencing type
export type CalendarEvent = {
  label: string
  timeLabel: string
  startDateTime: Date
  endDateTime: Date
  sourceId?: string // only for shift templates for now
  onClick?: (event: CalendarEvent) => void
  subEvents?: Array<CalendarEvent>
}

export type CalendarEvents = Record<string, Array<CalendarEvent>> // events by date

type CalendarProps = {
  eventsByDate: CalendarEvents
  setFilters?: (range: IRange) => void
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

export default function Calendar({ setFilters, eventsByDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<View>("month")

  const { weeks, dayLabels } = useMemo(() => {
    const dayLabels = getDayLabels(view, currentDate)
    const { rangeStart, rangeEnd } = getCalendarRange(view, currentDate)
    const weeks = getCalendarWeeks(view, currentDate, rangeStart, rangeEnd)

    return { weeks, dayLabels }
  }, [currentDate, view])
  useEffect(() => {
    if (setFilters) {
      setFilters(getCalendarRange(view, currentDate))
    }
  }, [currentDate, view, setFilters])

  return (
    <Box sx={{ width: "100%", mx: "auto" }}>
      <CalendarControls
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
      />

      <DayLabels view={view} dayLabels={dayLabels} />

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
                key={`wk-${wIdx}-day-${day}`}
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
        aspectRatio: view === "month" ? "1 / 1" : "auto",
        minHeight: view === "day" ? 300 : view === "week" ? 200 : undefined,
        p: 0.75,
        borderRadius: 1,
        border: "1px solid",
        borderColor: today ? "primary.main" : "divider",
        borderWidth: today ? 2 : 1,
        bgcolor: "background.paper",
        opacity: outside ? 0.45 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        fontSize: 14,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {format(day, "d")}
      </Typography>
      <Box
        sx={{
          mt: 0.5,
          display: "flex",
          flexDirection: view === "month" ? "column" : "row",
          flexWrap: "wrap",
          gap: 0.25,
        }}
      >
        {events.map((event) => (
          <Event
            key={`${event.label}${event.startDateTime}${event.endDateTime}`}
            event={event}
          />
        ))}
      </Box>
    </Box>
  )
}

type EventProps = {
  event: CalendarEvent
}

function Event({ event }: EventProps) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1,
        borderLeft: "3px solid",
        borderLeftColor: "primary.main",
        bgcolor: "primary.50",
        fontSize: 12,
        lineHeight: 1.2,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "primary.100",
          borderLeftColor: "primary.dark",
          transform: "translateY(-1px)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      }}
      title={`${event.label} ${event.timeLabel}`}
      onClick={() => event.onClick?.(event)}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "primary.dark" }}
        >
          {event.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontSize: 10 }}
        >
          {event.timeLabel}
        </Typography>
      </Box>
      {event.subEvents?.length ? (
        <Box
          sx={{
            mt: 0.75,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          {event.subEvents?.map((subEvent) => (
            <Box
              key={`${subEvent.label}${subEvent.startDateTime}`}
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 0.75,
                bgcolor: "secondary.50",
                border: "1px solid",
                borderColor: "secondary.200",
                fontSize: 10,
                fontWeight: 500,
                lineHeight: 1.2,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                flex: "0 0 auto",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  bgcolor: "secondary.100",
                  borderColor: "secondary.300",
                  transform: "scale(1.02)",
                },
              }}
              title={`${subEvent.label} ${subEvent.timeLabel}`}
              onClick={(e) => {
                e.stopPropagation()
                subEvent.onClick?.(subEvent)
              }}
            >
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "secondary.dark" }}
                >
                  {subEvent.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 9 }}
                >
                  {subEvent.timeLabel}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
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
