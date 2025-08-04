import { Link } from "react-router"

export default function Dashboard() {
  return (
    <>
      <Link to="/employees">Employees</Link>
      <Link to="/shift-template">Shift Template</Link>
    </>
  )
}
