import { useState } from "react"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"

enum RangeOption {
  thisMonth = "thisMonth",
  nextMonth = "nextMonth",
}
const rangeOptions = [
  { value: RangeOption.thisMonth, label: "This Month" },
  { value: RangeOption.nextMonth, label: "Next Month" },
]

export default function AutoAssignShifts() {
  const [isOpen, setIsOpen] = useState(false)
  const [rangeOption, setRangeOption] = useState<RangeOption>()

  function handleAutoAssign() {
    console.log("Auto assign")
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
        <DialogTitle>Auto Assign</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={rangeOption}
              onChange={(e) => setRangeOption(e.target.value as RangeOption)}
              label="Date Range"
            >
              {rangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAutoAssign}
            variant="contained"
            disabled={!rangeOption}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
