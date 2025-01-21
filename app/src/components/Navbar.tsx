import react, { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"

const Navbar = (): ReactElement => {
  const navigate = useNavigate()
  return (
    <>
      <div className="Navbar">
        <div className="Navbar-body">
          <div className="Navbar-body-logo">
            <span className="Text-color--pink-1000">Word</span>
            <span className="Text-color--orange-1000">Scramble</span>
          </div>
          <div className="Flex-row Margin-left--auto">
            <div
              className="Navbar-body-link Margin-right--20"
              onClick={() => {
                navigate("/home")
              }}
            >
              Home
            </div>
            <div
              className="Navbar-body-link"
              onClick={() => {
                navigate("/game")
              }}
            >
              Game
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
