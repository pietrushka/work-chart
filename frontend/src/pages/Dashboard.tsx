import { Link } from "react-router"
import { Button, Box } from "@mui/material"
import { useLogoutMutation } from "../redux/api/authApi"

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
        <Button component={Link} to="/employees" variant="contained">
          Employees
        </Button>
        <Button component={Link} to="/shift-template" variant="contained">
          Shift Template
        </Button>
        <Button onClick={() => logout()} variant="outlined" color="error">
          Logout
        </Button>
      </Box>
    </Box>
  )
}
