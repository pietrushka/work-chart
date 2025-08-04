import React, { useState } from "react"
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Alert,
} from "@mui/material"
import {
  ShiftTemplate,
  ShiftTemplateFormValues,
} from "../../types/shiftTemplate"
import getErrorMessage from "../../utils/getErrorMessage"
import { positions } from "../../constants"

const weekdaysOptions = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
]

type ShiftTemplateFormProps = {
  initialValues: ShiftTemplateFormValues
  onSubmit: (values: ShiftTemplateFormValues) => Promise<void>
}

export default function ShiftTemplateForm({
  initialValues,
  onSubmit,
}: ShiftTemplateFormProps) {
  const [form, setForm] = useState<Omit<ShiftTemplate, "id">>(initialValues)
  const [errorMessage, setErrorMessage] = useState<string>()

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSelectChange(e: SelectChangeEvent<string>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name as string]: value }))
  }

  function handleSelectMultipleChange(e: SelectChangeEvent<string[]>) {
    const { value } = e.target
    setForm((prev) => {
      const mod = { ...prev }
      mod.days = typeof value === "string" ? [Number(value)] : value.map(Number)
      return mod
    })
  }

  async function handleSubmit() {
    try {
      setErrorMessage(undefined)
      onSubmit(form)
      setForm(initialValues)
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error))
    }
  }

  return (
    <Box component="form" noValidate autoComplete="off">
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Position</InputLabel>
        <Select
          name="position"
          value={form.position}
          label="Position"
          onChange={handleSelectChange}
        >
          {positions.map((position) => (
            <MenuItem key={position} value={position}>
              {position}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Start Time"
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={handleInputChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="End Time"
            name="endTime"
            type="time"
            value={form.endTime}
            onChange={handleInputChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <FormControl fullWidth margin="normal">
        <InputLabel>Days of the week</InputLabel>
        <Select
          name="days"
          // @ts-expect-error - TODO: fix this
          value={form.days}
          label="Days of the week"
          onChange={handleSelectMultipleChange}
          multiple
        >
          {weekdaysOptions.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
        disabled={!form.name}
      >
        Add Template
      </Button>
    </Box>
  )
}
