import React from "react"
import { Navigate, Outlet } from "react-router"

type ProtectedRouteProps = {
  isAllowed: boolean
  isLoading: boolean
  redirectPath: string
  children?: React.ReactNode
}

export default function ProtectedRoute({
  isAllowed,
  isLoading,
  redirectPath,
  children,
}: ProtectedRouteProps) {
  if (isLoading) {
    return null
  }

  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />
  }

  return children ? children : <Outlet />
}
