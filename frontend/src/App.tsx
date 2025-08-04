import { BrowserRouter, Routes, Route } from "react-router"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Employees from "./pages/Employees"
import ShiftTemplate from "./pages/ShiftTemplate"
import ProtectedRoute from "./components/ProtectedRoute"
import { useGetCurrentUserQuery } from "./redux/api/authApi"
import { UserRole } from "./types/auth"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const { data: currentUser, isFetching } = useGetCurrentUserQuery()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute
              isAllowed={!currentUser}
              isLoading={false}
              redirectPath="/employees"
            />
          }
        >
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={!!currentUser}
              isLoading={isFetching}
              redirectPath="/login"
            />
          }
        >
          <Route path="/" element={<Dashboard />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAllowed={currentUser?.role === UserRole.ADMIN}
              isLoading={isFetching}
              redirectPath="/login"
            />
          }
        >
          <Route path="/employees" element={<Employees />} />
          <Route path="/shift-template" element={<ShiftTemplate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
