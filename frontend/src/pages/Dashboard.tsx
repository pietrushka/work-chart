import { Button } from "@mui/material"
import { Link } from "react-router"
import { useLogoutMutation } from "../redux/api/authApi"

export default function Dashboard() {
  const [logout] = useLogoutMutation()
  return (
    <>
      <Link to="/employees">Employees</Link>
      <Link to="/shift-template">Shift Template</Link>
      <Button onClick={() => logout()}>Logout</Button>
    </>
  )
}
