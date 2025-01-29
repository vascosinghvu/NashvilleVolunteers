import react, { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"

const Navbar = (): ReactElement => {
  const navigate = useNavigate()
  return (
    <>
      <div className="Navbar">
        <div className="Navbar-body">
          <div className="Navbar-body-logo">
            <span className="Text-color--blue-1000">Nashville</span>
            <span className="Text-color--red-1000">Volunteers</span>
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
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
