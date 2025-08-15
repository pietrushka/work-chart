import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
} from "@mui/material"
import { Outlet, Link } from "react-router"
import useUser from "../hooks./useUser"
import { useLogoutMutation } from "../redux/api/authApi"
import { UserRole } from "../types/auth"

export default function Layout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Container sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{ py: 2, textAlign: "center", bgcolor: "grey.200" }}
      >
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  )
}

const adminOptions = [
  { label: "My Shifts", to: "/my-shifts" },
  { label: "Employees", to: "/employees" },
  { label: "Shift Template", to: "/shift-template" },
  { label: "Manage Worker Shifts", to: "/manage-worker-shift" },
]

const employeeOptions = [
  { label: "My Shifts", to: "/my-shifts" },
  { label: "My Time Off", to: "/my-time-off" },
]

function Navbar() {
  const [logout] = useLogoutMutation()
  const currentUser = useUser()

  const options =
    currentUser?.role === UserRole.ADMIN ? adminOptions : employeeOptions

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #1976d2, #1565c0)",
        boxShadow: 2,
        borderRadius: 1,
        px: 2,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
            flexGrow: 1,
            letterSpacing: 1,
          }}
        ></Typography>

        {options.map(({ label, to }) => (
          <Button
            key={to}
            component={Link}
            to={to}
            sx={{
              color: "white",
              mx: 1,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            }}
          >
            {label}
          </Button>
        ))}

        <Button
          onClick={() => logout()}
          variant="contained"
          sx={{
            color: "white",
            mx: 1,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.15)",
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}
