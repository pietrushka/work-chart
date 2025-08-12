import { UserRole } from "../types/auth"
import AdminDashboard from "../components/Admin/AdminDashboard"
import EmployeeDashboard from "../components/Employee/EmployeeDashboard"
import useUser from "../hooks./useUser"

export default function Dashboard() {
  const currentUser = useUser()

  if (currentUser?.role === UserRole.ADMIN) {
    return <AdminDashboard />
  }

  return <EmployeeDashboard />
}
