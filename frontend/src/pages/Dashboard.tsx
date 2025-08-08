import { Link } from "react-router"
import { Button, Box } from "@mui/material"
import { useLogoutMutation } from "../redux/api/authApi"

const adminOptions = [
  { label: "Employees", to: "/employees" },
  { label: "Shift Template", to: "/shift-template" },
  { label: "Manage Worker Shifts", to: "/manage-worker-shift" },
]

export default function Dashboard() {
  const [logout] = useLogoutMutation()

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "end",
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        {adminOptions.map(({ label, to }) => (
          <Button component={Link} to={to} variant="contained">
            {label}
          </Button>
        ))}
        <Button onClick={() => logout()} variant="outlined" color="error">
          Logout
        </Button>
      </Box>
    </Box>
  )
}
