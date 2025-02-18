import { Route, Routes, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "./context/AuthContext"
import Listings from "./pages/Listings"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Logout from "./pages/Logout"
import VolunteerSignup from "./pages/VolunteerSignup"
import Profile from "./pages/Profile"
import OrganizationSignup from "./pages/OrganizationSignup"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { UserRole } from "./types/auth"
import VolunteerDashboard from "./pages/VolunteerDashboard"
import OrganizationDashboard from "./pages/OrganizationDashboard"

function App() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (window.location.pathname === "/") {
      navigate(user ? "/listings" : "/home")
    }
  }, [user, navigate])

  return (
    <AuthProvider>
      <Routes>
        <Route path="/home" element={<Landing />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/volunteer-signup" element={<VolunteerSignup />} />
        <Route path="/organization-signup" element={<OrganizationSignup />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/volunteer-dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.VOLUNTEER]}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization-dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ORGANIZATION]}>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
