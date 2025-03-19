import { Route, Routes, Navigate, useNavigate } from "react-router-dom"
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
import OrganizationProfile from "./pages/organization/OrganizationProfile"
import CreateEvent from "./pages/organization/CreateEvent"
import EditEvent from "./pages/organization/EditEvent"
import OrganizationDetails from "./pages/organization/OrganizationDetails"

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
        {/* Public Routes */}
        <Route path="/home" element={<Landing />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/volunteer/signup" element={<VolunteerSignup />} />
        <Route path="/organization/signup" element={<OrganizationSignup />} />

        {/* Volunteer-Specific Routes */}
        <Route
          path="/volunteer/profile"
          element={
            <ProtectedRoute allowedRoles={[UserRole.VOLUNTEER]}>
              <VolunteerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.VOLUNTEER]}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteer/listings"
          element={
            <ProtectedRoute allowedRoles={[UserRole.VOLUNTEER]}>
              <Listings />
            </ProtectedRoute>
          }
        />

        {/* Organization-Specific Routes */}
        <Route
          path="/organization/profile"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ORGANIZATION]}>
              <OrganizationProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ORGANIZATION]}>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />

        {/* Add the new route for creating events */}
        <Route 
          path="/organization/create-event" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ORGANIZATION]}>
              <CreateEvent />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/organization/edit-event/:eventId"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ORGANIZATION]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route path="/organization/:id" element={<OrganizationDetails />} />

        {/* Catch-All: Redirect to Listings if Route Not Found */}
        <Route path="*" element={<Navigate to="/listings" />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
