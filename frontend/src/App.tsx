import { BrowserRouter, Routes, Route } from "react-router"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Employees from "./pages/Employees"
import ShiftTemplate from "./pages/ShiftTemplate"
import Dashboard from "./pages/Dashboard"
import ActivateAccount from "./pages/ActivateAccount"
import ProtectedRoute from "./components/ProtectedRoute"
import { useGetCurrentUserQuery } from "./redux/api/authApi"
import { UserRole } from "./types/auth"
import ManageWorkerShift from "./pages/ManageWorkerShift"
import Layout from "./components/Layout"
import MyShifts from "./pages/MyShifts"

export default function App() {
  const { data, isError, isFetching } = useGetCurrentUserQuery()

  const currentUser = isError ? undefined : data
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/activate-account/:token" element={<ActivateAccount />} />

        <Route
          element={
            <ProtectedRoute
              isAllowed={!currentUser}
              isLoading={false}
              redirectPath="/"
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
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/my-shifts" element={<MyShifts />} />
          </Route>
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
          <Route element={<Layout />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/shift-template" element={<ShiftTemplate />} />
            <Route
              path="/manage-worker-shift"
              element={<ManageWorkerShift />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
