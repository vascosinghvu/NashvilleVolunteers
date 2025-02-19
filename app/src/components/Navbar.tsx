import { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "./Icon"
import { useAuth } from "../context/AuthContext"
import { UserRole } from "../types/auth"

const Navbar = (): ReactElement => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const userRole = localStorage.getItem("user_role") as UserRole | null // Get role from storage

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate("/logout")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="Navbar">
      <div className="Navbar-body">
        {/* Logo */}
        <div
          className="Navbar-body-logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer" }}
        >
          <Icon glyph="heart" regular />
          <span className="Text--bold">Nashville Volunteers</span>
        </div>

        {/* Navigation Links */}
        <div className="Flex-row Margin-left--auto Align-items--center">
          {user ? (
            <>
              {/* Show dashboard link based on role */}
              {userRole === UserRole.VOLUNTEER && (
                <div
                  className="Navbar-body-link Margin-right--20"
                  onClick={() => navigate("/volunteer/dashboard")}
                >
                  Dashboard
                </div>
              )}
              {userRole === UserRole.ORGANIZATION && (
                <div
                  className="Navbar-body-link Margin-right--20"
                  onClick={() => navigate("/organization/dashboard")}
                >
                  Dashboard
                </div>
              )}

              {userRole === UserRole.VOLUNTEER && (
                <div
                  className="Navbar-body-link Margin-right--20"
                  onClick={() => navigate("/listings")}
                >
                  Listings
                </div>
              )}

              {/* Show profile link based on role */}
              {userRole === UserRole.VOLUNTEER && (
                <div
                  className="Navbar-body-link Margin-right--20"
                  onClick={() => navigate("/volunteer/profile")}
                >
                  Profile
                </div>
              )}
              {userRole === UserRole.ORGANIZATION && (
                <div
                  className="Navbar-body-link Margin-right--20"
                  onClick={() => navigate("/organization/profile")}
                >
                  Profile
                </div>
              )}

              {/* Logout Button */}
              <div
                className="Button Button--small Button-color--blue-1000"
                onClick={handleSignOut}
              >
                Logout
              </div>
            </>
          ) : (
            <>
              {/* If not logged in, show login & signup */}
              <div
                className="Button Button-color--blue-1000 Button--small Margin-right--20"
                onClick={() => navigate("/login")}
              >
                Login
              </div>
              <div
                className="Button Button-color--yellow-1000 Button--small"
                onClick={() => navigate("/volunteer/signup")}
              >
                Sign Up
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
