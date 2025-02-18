import { Route, Routes, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "./context/AuthContext"
import Listings from "./pages/volunteer/VolunteerListings"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Logout from "./pages/Logout"
import VolunteerSignup from "./pages/volunteer/VolunteerSignup"
import VolunteerProfile from "./pages/volunteer/VolunteerProfile"
import OrganizationSignup from "./pages/organization/OrganizationSignup"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { UserRole } from "./types/auth"
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard"
import OrganizationDashboard from "./pages/organization/OrganizationDashboard"

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
        <Route path="/profile" element={<VolunteerProfile />} />
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
