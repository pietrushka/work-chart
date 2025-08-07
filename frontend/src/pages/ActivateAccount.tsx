import React, { useState } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
} from "@mui/material"
import { useActivateAccountMutation } from "../redux/api/authApi"
import { useNavigate, useParams } from "react-router"
import getErrorMessage from "../utils/getErrorMessage"

interface ActivateAccountFormData {
  password: string
  confirmPassword: string
}

export default function ActivateAccount() {
  const [activateAccount] = useActivateAccountMutation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ActivateAccountFormData>({
    password: "",
    confirmPassword: "",
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const { token } = useParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (!token) {
        setErrorMessage("Token is required")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Passwords do not match")
        return
      }

      setErrorMessage(undefined)

      await activateAccount({
        password: formData.password,
        token,
      }).unwrap()

      navigate("/login")
    } catch (e) {
      setErrorMessage(getErrorMessage(e))
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5">
            Activate account
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
