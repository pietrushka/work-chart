import React, { useState } from "react"
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Alert,
} from "@mui/material"
import { EmployeeFormValues } from "../../../types/employee"
import getErrorMessage from "../../../utils/getErrorMessage"
import { positions } from "../../../constants"

type EmployeeFormProps = {
  initialValues: EmployeeFormValues
  onSubmit: (values: EmployeeFormValues) => Promise<void>
}

export default function EmployeeForm({
  initialValues,
  onSubmit,
}: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormValues>(initialValues)
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

  async function handleSubmit(e: React.FormEvent) {
    try {
      e.preventDefault()
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
        label="First Name"
        name="first_name"
        value={form.first_name}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Last Name"
        name="last_name"
        value={form.last_name}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={form.email}
        onChange={handleInputChange}
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

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        Submit
      </Button>
    </Box>
  )
}
