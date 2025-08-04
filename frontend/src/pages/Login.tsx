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
import { useLoginMutation } from "../redux/api/authApi"
import { useNavigate } from "react-router"
import getErrorMessage from "../utils/getErrorMessage"

interface LoginFormData {
  email: string
  password: string
}

export default function Login() {
  const [login] = useLoginMutation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [errorMessage, setErrorMessage] = useState<string>()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setErrorMessage(undefined)
      await login(formData).unwrap()
      navigate("/")
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
            Sign in
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
