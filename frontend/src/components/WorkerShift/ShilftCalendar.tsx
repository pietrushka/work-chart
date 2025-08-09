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
  set,
  isAfter,
  startOfMonth,
  startOfWeek,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns"
import { Box, IconButton, Typography, ButtonGroup, Button } from "@mui/material"
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import ChevronRight from "@mui/icons-material/ChevronRight"
import { ShiftTemplate } from "../../types/shiftTemplate"
import { WorkerShift } from "../../types/workerShift"

// Week starts on Monday
const WEEK_STARTS_ON = 1 as const

type ShilftCalendarProps = {
  shiftTemplates: Array<ShiftTemplate>
  workerShifts: Array<WorkerShift>
  openAssignShiftModal: (
    templateId: string,
    startDateTime: string,
    endDateTime: string,
  ) => void
}

type CalendarEvent = {
  id: string
  kind: "template" | "shift"
  label: string
  timeLabel: string
  templateId?: string
  startTime?: string
  endTime?: string
  startDateTime?: string
  endDateTime?: string
}

type View = "month" | "week" | "day"

export default function ShilftCalendar({
  shiftTemplates,
  workerShifts,
  openAssignShiftModal,
}: ShilftCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<View>("month")

  const { weeks, dayLabels, eventsByDate } = useMemo(() => {
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

    const headerStart = startOfWeek(currentDate, {
      weekStartsOn: WEEK_STARTS_ON,
    })
    const labels: string[] =
      view === "day"
        ? [format(currentDate, "EEE")]
        : Array.from({ length: 7 }).map((_, idx) =>
            format(addDays(headerStart, idx), "EEE"),
          )

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

    const templateById = new Map(shiftTemplates.map((t) => [t.id, t]))
    const workerShiftEventsByDate = workerShifts.reduce<
      Record<string, CalendarEvent[]>
    >((acc, ws) => {
      if (!ws.start_date || !ws.end_date) return acc
      const start = parseISO(ws.start_date)
      const end = parseISO(ws.end_date)
      if (!isValid(start) || !isValid(end)) return acc
      const key = format(start, "yyyy-MM-dd")
      const template = templateById.get(ws.template_id)
      const label = template?.name ?? "Shift"
      const timeLabel = `${format(start, "HH:mm")}-${format(end, "HH:mm")}`
      const event: CalendarEvent = {
        id: `shift-${ws.id}`,
        kind: "shift",
        label,
        timeLabel,
        templateId: ws.template_id,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
      }
      acc[key] = acc[key] ? [...acc[key], event] : [event]
      return acc
    }, {})

    const eventsByDate: Record<string, CalendarEvent[]> = {
      ...workerShiftEventsByDate,
    }

    // Fill in recurring template events across the displayed calendar range
    let d = rangeStart
    while (d <= rangeEnd) {
      const dow = getDay(d) // 0 (Sun) - 6 (Sat)
      const key = format(d, "yyyy-MM-dd")
      for (const tpl of shiftTemplates) {
        if (tpl.days.includes(dow)) {
          const event: CalendarEvent = {
            id: `tpl-${tpl.id}-${key}`,
            kind: "template",
            label: tpl.name,
            timeLabel: `${tpl.startTime}-${tpl.endTime}`,
            templateId: tpl.id,
            startTime: tpl.startTime,
            endTime: tpl.endTime,
          }
          eventsByDate[key] = eventsByDate[key]
            ? [...eventsByDate[key], event]
            : [event]
        }
      }
      d = addDays(d, 1)
    }

    return { weeks: allWeeks, dayLabels: labels, eventsByDate }
  }, [currentDate, view, shiftTemplates, workerShifts])

  function buildDateWithTime(baseDate: Date, hhmm: string): Date {
    const [hoursStr, minutesStr] = hhmm.split(":")
    const hours = Number(hoursStr ?? 0)
    const minutes = Number(minutesStr ?? 0)
    return set(baseDate, { hours, minutes, seconds: 0, milliseconds: 0 })
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 720, mx: "auto" }}>
      <CalendarControls
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
      />

      {/* Day labels */}
      <Box
        sx={{
          display: "grid",
          border: "1px solid red",
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

      {/* Calendar grid */}
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
            {week.map((day) => {
              const outside =
                view === "month" ? !isSameMonth(day, currentDate) : false
              const today = isToday(day)
              const key = format(day, "yyyy-MM-dd")
              const events = eventsByDate[key] ?? []
              return (
                <Box
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
                        key={ev.id}
                        sx={{
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          borderLeft: "3px solid",
                          borderLeftColor:
                            ev.kind === "template"
                              ? "info.main"
                              : "success.main",
                          bgcolor: "action.hover",
                          fontSize: 12,
                          lineHeight: 1.2,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        title={`${ev.label} ${ev.timeLabel}`}
                        onClick={() => {
                          if (
                            ev.startDateTime &&
                            ev.endDateTime &&
                            ev.templateId
                          ) {
                            openAssignShiftModal(
                              ev.templateId,
                              ev.startDateTime,
                              ev.endDateTime,
                            )
                            return
                          }
                          if (ev.templateId && ev.startTime && ev.endTime) {
                            // Compute ISO datetimes based on the clicked day
                            const startDt = buildDateWithTime(day, ev.startTime)
                            let endDt = buildDateWithTime(day, ev.endTime)
                            if (!isAfter(endDt, startDt)) {
                              endDt = addDays(endDt, 1)
                            }
                            openAssignShiftModal(
                              ev.templateId,
                              startDt.toISOString(),
                              endDt.toISOString(),
                            )
                          }
                        }}
                      >
                        {ev.label} {ev.timeLabel}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>
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
