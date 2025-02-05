import { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "./Icon"
import { useAuth } from "../context/AuthContext"

const Navbar = (): ReactElement => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate("/logout")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      <div className="Navbar">
        <div className="Navbar-body">
          <div
            className="Navbar-body-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <Icon glyph="heart" regular />
            <span className="Text--bold">Nashville Volunteers</span>
          </div>
          <div className="Flex-row Margin-left--auto Align-items--center">
            <div
              className="Navbar-body-link Margin-right--20"
              onClick={() => {
                navigate("/")
              }}
            >
              Home
            </div>
            {user ? (
              <>
                <div
                  className="Navbar-body-link Margin-right--20"
                  onClick={() => navigate("/profile")}
                >
                  Profile
                </div>
                <div
                  className="Button Button--small Button-color--blue-1000"
                  onClick={handleSignOut}
                >
                  Logout
                </div>
              </>
            ) : (
              <>
                <div
                  className="Button Button-color--blue-1000 Button--small Margin-right--20"
                  onClick={() => navigate("/login")}
                >
                  Login
                </div>
                <div
                  className="Button Button-color--yellow-1000 Button--small"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </div>
              </>
            )}
          </div>
          {user ? (
            <>
              <div
                className="Navbar-body-link Margin-right--20"
                onClick={() => navigate("/profile")}
              >
                Profile
              </div>
              <div
                className="Navbar-body-link"
                onClick={handleSignOut}
              >
                Sign Out
              </div>
            </>
          ) : (
            <>
              <div
                className="Navbar-body-link Margin-right--20"
                onClick={() => navigate("/login")}
              >
                Login
              </div>
              <div
                className="Navbar-body-link"
                onClick={() => navigate("/signup")}
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
