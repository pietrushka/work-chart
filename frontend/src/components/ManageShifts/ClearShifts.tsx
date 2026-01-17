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
  Typography,
} from "@mui/material"
import { useClearShiftsMutation } from "../../redux/api/workerShiftApi"

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

export default function ClearShifts() {
  const [isOpen, setIsOpen] = useState(false)
  const [rangeOption, setRangeOption] = useState<RangeOption>()
  const [error, setError] = useState<string>("")
  const [successCount, setSuccessCount] = useState<number | null>(null)

  const [clearShifts, { isLoading: isClearing }] = useClearShiftsMutation()

  async function handleClearShifts() {
    if (!rangeOption) return

    setError("")
    setSuccessCount(null)
    try {
      const range = getDateRange(rangeOption)
      const result = await clearShifts(range).unwrap()
      setSuccessCount(result.count)
      setRangeOption(undefined)
    } catch {
      setError("Failed to clear shifts. Please try again.")
    }
  }

  function handleClose() {
    setIsOpen(false)
    setSuccessCount(null)
    setError("")
    setRangeOption(undefined)
  }

  return (
    <>
      <Button variant="outlined" color="error" onClick={() => setIsOpen(true)}>
        Clear Shifts
      </Button>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Clear Shifts</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {successCount !== null ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Successfully cleared {successCount} shift
              {successCount !== 1 ? "s" : ""}.
            </Alert>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Select a date range to clear all shifts in that period. This
                action cannot be undone.
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
          <Button onClick={handleClose}>
            {successCount !== null ? "Close" : "Cancel"}
          </Button>
          {successCount === null && (
            <Button
              onClick={handleClearShifts}
              variant="contained"
              color="error"
              disabled={!rangeOption || isClearing}
            >
              {isClearing ? "Clearing..." : "Clear Shifts"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
