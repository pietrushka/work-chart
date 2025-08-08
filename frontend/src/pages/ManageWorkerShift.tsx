import React, { useState } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Person, Work, Schedule } from "@mui/icons-material"
import { useGetEmployeesQuery } from "../redux/api/employeeApi"
import { useGetShiftTemplatesQuery } from "../redux/api/shiftTemplateApi"
import {
  useGetWorkersShiftsQuery,
  useAddWorkerShiftMutation,
} from "../redux/api/workerShiftApi"
import ShilftCalendar from "../components/WorkerShift/ShilftCalendar"

export default function ManageWorkerShift() {
  const { data: shiftTemplates, isLoading: isLoadingShifts } =
    useGetShiftTemplatesQuery()
  const { data: employees, isLoading: isLoadingEmployees } =
    useGetEmployeesQuery()
  const { data: workerShiftsResponse } = useGetWorkersShiftsQuery()
  const [addWorkerShift] = useAddWorkerShiftMutation()
  const workerShifts = workerShiftsResponse?.items || []

  const [selectedStartDateTime, setSelectedStartDateTime] = useState<string>()
  const [selectedEndDateTime, setSelectedEndDateTime] = useState<string>()
  const [selectedShift, setSelectedShift] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")

  const shifts = shiftTemplates?.items || []
  const workers = employees?.items || []

  async function handleAssignEmployee() {
    if (!selectedShift || !selectedEmployee) {
      return
    }

    const newAssignment = {
      template_id: selectedShift,
      worker_id: selectedEmployee,
      start_date: selectedStartDateTime ?? "",
      end_date: selectedEndDateTime ?? "",
    }
    await addWorkerShift(newAssignment).unwrap()
    setSelectedShift("")
    setSelectedEmployee("")
    setShowAssignmentDialog(false)
    setSuccessMessage("Employee successfully assigned to shift template!")

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const getEmployeeAssignments = (employeeId: string) => {
    if (!workerShifts) return []
    return workerShifts
      .filter((a) => a.worker_id === employeeId)
      .map((a) => shifts.find((s) => s.id === a.template_id))
      .filter(Boolean)
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // Remove seconds if present
  }

  const getDayNames = (days: number[]) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return days.map((day) => dayNames[day]).join(", ")
  }

  if (isLoadingShifts || isLoadingEmployees) {
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

      <ShilftCalendar
        shiftTemplates={shifts}
        workerShifts={workerShifts}
        openAssignShiftModal={(templateId, startDateTime, endDateTime) => {
          setSelectedShift(templateId)
          setSelectedStartDateTime(startDateTime)
          setSelectedEndDateTime(endDateTime)
          setShowAssignmentDialog(true)
        }}
      />

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAssignmentDialog(true)}
          startIcon={<Work />}
        >
          Assign Employee to Shift
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Shift Templates Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Shift Templates
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {shifts.map((shift) => (
              <Card key={shift.id} variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Schedule color="primary" />
                    <Typography variant="h6">{shift.name}</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Position: {shift.position}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Time: {formatTime(shift.startTime)} -{" "}
                    {formatTime(shift.endTime)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Days: {getDayNames(shift.days)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Employees Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Employees
          </Typography>
          <Paper sx={{ p: 2 }}>
            <List>
              {workers.map((employee, idx) => (
                <React.Fragment key={employee.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${employee.first_name} ${employee.last_name}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {employee.email}
                          </Typography>
                          {employee.position && (
                            <Typography variant="body2" color="text.secondary">
                              Position: {employee.position}
                            </Typography>
                          )}
                          {getEmployeeAssignments(employee.id).length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="primary">
                                Assigned to:{" "}
                                {getEmployeeAssignments(employee.id)
                                  .map((s) => s!.name)
                                  .join(", ")}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < workers.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Assignment Dialog */}
      <Dialog
        open={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Employee to Shift Template</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {selectedStartDateTime && selectedEndDateTime && (
              <Alert severity="info">
                Selected: {new Date(selectedStartDateTime).toLocaleString()} →{" "}
                {new Date(selectedEndDateTime).toLocaleString()}
              </Alert>
            )}
            <FormControl fullWidth>
              <InputLabel>Select Shift Template</InputLabel>
              <Select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                label="Select Shift Template"
              >
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id}>
                    {shift.name} - {shift.position} (
                    {formatTime(shift.startTime)}-{formatTime(shift.endTime)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Select Employee"
              >
                {workers.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}{" "}
                    {employee.position && `(${employee.position})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignmentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAssignEmployee}
            variant="contained"
            disabled={!selectedShift || !selectedEmployee}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
