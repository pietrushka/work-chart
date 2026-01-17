import { useMemo, useState } from "react"
import { Box, Container, Typography, Button, Alert } from "@mui/material"
import { Work } from "@mui/icons-material"
import { useGetShiftTemplatesQuery } from "../redux/api/shiftTemplateApi"
import { useGetWorkersShiftsQuery } from "../redux/api/workerShiftApi"
import Calendar, { CalendarEvent } from "../components/Calendar"
import { IRange } from "../types/date"
import { skipToken } from "@reduxjs/toolkit/query"
import ManualAssignmentDialog from "../components/ManageShifts/ManualAssignmentDialog"
import AutoAssignShifts from "../components/ManageShifts/AutoAssignShifts"
import ClearShifts from "../components/ManageShifts/ClearShifts"
import computeManagementEvents from "../utils/computeManagementEvents"

export default function ManageWorkerShift() {
  const [selectedStartDateTime, setSelectedStartDateTime] = useState<string>()
  const [selectedEndDateTime, setSelectedEndDateTime] = useState<string>()
  const [selectedShift, setSelectedShift] = useState<string>("")
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [filters, setFilters] = useState<IRange>()

  const { data: shiftTemplates, isLoading: isLoadingShifts } =
    useGetShiftTemplatesQuery()

  const { data: workerShiftsResponse, isLoading: isLoadingWorkerShifts } =
    useGetWorkersShiftsQuery(
      // TODO optimize, do not fetch already fetched data
      filters
        ? {
            range_start: filters?.rangeStart.toISOString(),
            range_end: filters?.rangeEnd.toISOString(),
          }
        : skipToken,
    )
  const workerShifts = workerShiftsResponse?.items
  const shifts = shiftTemplates?.items

  const eventsByDate = useMemo(() => {
    if (!filters || !workerShifts || !shifts) {
      return {}
    }
    const { rangeStart, rangeEnd } = filters

    function shiftTemplateClickHandler(event: CalendarEvent) {
      setSelectedShift(event.sourceId!)
      setSelectedStartDateTime(event.startDateTime.toISOString())
      setSelectedEndDateTime(event.endDateTime.toISOString())
      setShowAssignmentDialog(true)
    }
    function workerShiftClickHandler(event: CalendarEvent) {
      console.log("workerShiftClickHandler", event)
    }

    const eventsByDate = computeManagementEvents({
      workerShifts,
      shiftTemplates: shifts,
      shiftTemplateClickHandler,
      workerShiftClickHandler,
      rangeStart,
      rangeEnd,
    })

    return eventsByDate
  }, [filters, workerShifts, shifts])

  if (isLoadingShifts || isLoadingWorkerShifts) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loading...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Worker Shifts
      </Typography>

      <Calendar eventsByDate={eventsByDate} setFilters={setFilters} />

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" sx={{ my: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAssignmentDialog(true)}
          startIcon={<Work />}
        >
          Assign Employee to Shift
        </Button>

        <Box display="flex" gap={2}>
          <ClearShifts />
          <AutoAssignShifts />
        </Box>
      </Box>

      <ManualAssignmentDialog
        showAssignmentDialog={showAssignmentDialog}
        setShowAssignmentDialog={setShowAssignmentDialog}
        selectedStartDateTime={selectedStartDateTime}
        selectedEndDateTime={selectedEndDateTime}
        selectedShift={selectedShift}
        setSelectedShift={setSelectedShift}
        setSuccessMessage={setSuccessMessage}
      />
    </Container>
  )
}
