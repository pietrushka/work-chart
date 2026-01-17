import { addDays, format, getDay, isBefore, parseISO, isAfter } from "date-fns"
import { buildDateWithTime } from "./dateHelpers"
import { CalendarEvent, CalendarEvents } from "../components/Calendar"
import { ShiftTemplate } from "../types/shiftTemplate"
import { WorkerShift } from "../types/workerShift"

type ComputeManagementEvents = {
  shiftTemplates: Array<ShiftTemplate>
  workerShifts: Array<WorkerShift>
  rangeStart: Date
  rangeEnd: Date
  shiftTemplateClickHandler: (event: CalendarEvent) => void
  workerShiftClickHandler: (event: CalendarEvent) => void
}

function produceWorkerShiftCalendarEvent(
  workerShift: WorkerShift,
  workerShiftClickHandler: (event: CalendarEvent) => void,
) {
  const start = parseISO(workerShift.start_date)
  const end = parseISO(workerShift.end_date)
  const label = "Shift"
  const timeLabel = `${format(start, "HH:mm")}-${format(end, "HH:mm")}`
  const event: CalendarEvent = {
    label,
    timeLabel,
    startDateTime: start,
    endDateTime: end,
    onClick: workerShiftClickHandler,
  }

  return event
}

// Convert JS getDay (0=Sun, 6=Sat) to app format (1=Mon, 7=Sun)
function jsDayToAppDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay
}

export default function computeManagementEvents({
  shiftTemplates,
  workerShifts,
  rangeStart,
  rangeEnd,
  shiftTemplateClickHandler,
  workerShiftClickHandler,
}: ComputeManagementEvents): CalendarEvents {
  const calendarEvents: CalendarEvents = {}

  // for now shift templates are just reccuring (no standalone)
  if (shiftTemplates?.length) {
    // Fill in recurring template events across the displayed calendar range
    let d = rangeStart
    while (d <= rangeEnd) {
      const dow = jsDayToAppDay(getDay(d)) // 1 (Mon) - 7 (Sun)
      const key = format(d, "yyyy-MM-dd")
      for (const template of shiftTemplates) {
        // Check if current date is within template's date range (if specified)
        const templateStartDate = template.startDate
          ? parseISO(template.startDate)
          : null
        const templateEndDate = template.endDate
          ? parseISO(template.endDate)
          : null

        // Skip if before startDate (when startDate is provided)
        if (templateStartDate && isBefore(d, templateStartDate)) {
          continue
        }
        // Skip if after endDate (when endDate is provided)
        if (templateEndDate && isAfter(d, templateEndDate)) {
          continue
        }

        if (template.days.includes(dow)) {
          const startDateTime = buildDateWithTime(d, template.startTime)
          let endDateTime = buildDateWithTime(d, template.endTime)
          if (!isAfter(endDateTime, startDateTime)) {
            endDateTime = addDays(endDateTime, 1)
          }

          const relatedWorkerShifts = workerShifts.filter(
            (workerShift) =>
              workerShift.template_id === template.id &&
              !isAfter(workerShift.start_date, endDateTime) &&
              !isBefore(workerShift.end_date, startDateTime),
          )
          const subEvents = relatedWorkerShifts.map((workerShift) =>
            produceWorkerShiftCalendarEvent(
              workerShift,
              workerShiftClickHandler,
            ),
          )

          const event: CalendarEvent = {
            label: template.name,
            timeLabel: `${template.startTime}-${template.endTime}`,
            startDateTime,
            endDateTime,
            sourceId: template.id,
            onClick: shiftTemplateClickHandler,
            ...(subEvents.length ? { subEvents } : {}),
          }

          calendarEvents[key] = calendarEvents[key]
            ? [...calendarEvents[key], event]
            : [event]
        }
      }
      d = addDays(d, 1)
    }
  }

  return calendarEvents
}
