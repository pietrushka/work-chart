import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import {
  useAutoAssignMutation,
  useGetAssignmentSuggestionsQuery,
  useAcceptSuggestionsMutation,
  useDeclineSuggestionsMutation,
} from "../../redux/api/workerShiftApi"
import { useGetEmployeesQuery } from "../../redux/api/employeeApi"
import { useGetShiftTemplatesQuery } from "../../redux/api/shiftTemplateApi"

enum RangeOption {
  thisMonth = "thisMonth",
  nextMonth = "nextMonth",
}

const rangeOptions = [
  { value: RangeOption.thisMonth, label: "This Month" },
  { value: RangeOption.nextMonth, label: "Next Month" },
]

function getDateRange(option: RangeOption) {
  const now = new Date()
  let start: Date
  let end: Date

  if (option === RangeOption.thisMonth) {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  } else {
    start = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    end = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59)
  }

  return {
    range_start: start.toISOString(),
    range_end: end.toISOString(),
  }
}

export default function AutoAssignShifts() {
  const [isOpen, setIsOpen] = useState(false)
  const [rangeOption, setRangeOption] = useState<RangeOption>()
  const [error, setError] = useState<string>("")

  const { data: suggestionsResponse } = useGetAssignmentSuggestionsQuery()
  const { data: employeesResponse } = useGetEmployeesQuery()
  const { data: shiftTemplatesResponse } = useGetShiftTemplatesQuery()

  const [autoAssign, { isLoading: isAutoAssigning }] = useAutoAssignMutation()
  const [acceptSuggestions, { isLoading: isAccepting }] =
    useAcceptSuggestionsMutation()
  const [declineSuggestions, { isLoading: isDeclining }] =
    useDeclineSuggestionsMutation()

  const suggestions = suggestionsResponse?.items ?? []
  const employees = employeesResponse?.items ?? []
  const shiftTemplates = shiftTemplatesResponse?.items ?? []

  const hasSuggestions = suggestions.length > 0

  function getEmployeeName(workerId: string) {
    const employee = employees.find((e) => e.id === workerId)
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : "Unknown"
  }

  function getTemplateName(templateId: string) {
    const template = shiftTemplates.find((t) => t.id === templateId)
    return template ? template.name : "Unknown"
  }

  async function handleAutoAssign() {
    if (!rangeOption) return

    setError("")
    try {
      const range = getDateRange(rangeOption)
      await autoAssign({
        ...range,
        overwrite_shifts: false,
      }).unwrap()
      setRangeOption(undefined)
    } catch {
      setError("Failed to generate suggestions. Please try again.")
    }
  }

  async function handleAccept() {
    setError("")
    try {
      await acceptSuggestions().unwrap()
      setIsOpen(false)
    } catch {
      setError("Failed to accept suggestions. Please try again.")
    }
  }

  async function handleDecline() {
    setError("")
    try {
      await declineSuggestions().unwrap()
    } catch {
      setError("Failed to decline suggestions. Please try again.")
    }
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsOpen(true)}
      >
        Auto Assign
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Auto Assign Shifts</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {hasSuggestions ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pending Suggestions ({suggestions.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review the suggested shift assignments below. Accept to create
                the shifts or decline to remove the suggestions.
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Shift Template</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suggestions.map((suggestion) => {
                    const startDate = new Date(suggestion.start_date)
                    const endDate = new Date(suggestion.end_date)
                    return (
                      <TableRow key={suggestion.id}>
                        <TableCell>
                          {getEmployeeName(suggestion.worker_id)}
                        </TableCell>
                        <TableCell>
                          {getTemplateName(suggestion.template_id)}
                        </TableCell>
                        <TableCell>
                          {startDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {startDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {endDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Select a date range to generate shift assignment suggestions.
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={rangeOption ?? ""}
                  onChange={(e) =>
                    setRangeOption(e.target.value as RangeOption)
                  }
                  label="Date Range"
                >
                  {rangeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          {hasSuggestions ? (
            <>
              <Button
                onClick={handleDecline}
                color="error"
                disabled={isDeclining || isAccepting}
              >
                {isDeclining ? "Declining..." : "Decline All"}
              </Button>
              <Button
                onClick={handleAccept}
                variant="contained"
                disabled={isAccepting || isDeclining}
              >
                {isAccepting ? "Accepting..." : "Accept All"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleAutoAssign}
              variant="contained"
              disabled={!rangeOption || isAutoAssigning}
            >
              {isAutoAssigning ? "Generating..." : "Generate Suggestions"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
