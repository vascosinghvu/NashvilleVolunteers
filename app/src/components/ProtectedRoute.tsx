import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { UserRole } from "../types/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useAuth()
  const userRole = localStorage.getItem("user_role") as UserRole | null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/listings" replace />
  }

  return <>{children}</>
}
