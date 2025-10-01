import { Dispatch, SetStateAction, useState } from "react"
import {
  Box,
  Button,
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
import { useGetEmployeesQuery } from "../../redux/api/employeeApi"
import { useAddWorkerShiftMutation } from "../../redux/api/workerShiftApi"
import { removeTimeSeconds } from "../../utils/dateHelpers"
import { useGetShiftTemplatesQuery } from "../../redux/api/shiftTemplateApi"

type ManualAssignmentDialogProps = {
  showAssignmentDialog: boolean
  setShowAssignmentDialog: Dispatch<SetStateAction<boolean>>
  selectedStartDateTime: string | undefined
  selectedEndDateTime: string | undefined
  selectedShift: string | undefined
  setSelectedShift: Dispatch<SetStateAction<string>>
  setSuccessMessage: Dispatch<SetStateAction<string>>
}

export default function ManualAssignmentDialog({
  showAssignmentDialog,
  setShowAssignmentDialog,
  selectedStartDateTime,
  selectedEndDateTime,
  selectedShift,
  setSelectedShift,
  setSuccessMessage,
}: ManualAssignmentDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")

  const [addWorkerShift] = useAddWorkerShiftMutation()

  const { data: employees } = useGetEmployeesQuery()
  const workers = employees?.items || []

  const { data: shiftTemplates } = useGetShiftTemplatesQuery()
  const shifts = shiftTemplates?.items || []

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

  return (
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
                  {removeTimeSeconds(shift.startTime)}-
                  {removeTimeSeconds(shift.endTime)})
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
  )
}
