import react, { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "./Icon"

const Navbar = (): ReactElement => {
  const navigate = useNavigate()
  return (
    <>
      <div className="Navbar">
        <div className="Navbar-body">
          <div className="Navbar-body-logo">
            <Icon glyph="heart" regular />
            <span className="Text--bold">Nashville Volunteers</span>
          </div>
          <div className="Flex-row Margin-left--auto">
            <div
              className="Navbar-body-link Margin-right--20"
              onClick={() => {
                navigate("/")
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
