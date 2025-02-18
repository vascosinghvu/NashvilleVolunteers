import React, { type ReactElement } from "react"
import { useNavigate } from "react-router-dom"

const Logout = (): ReactElement => {
  const navigate = useNavigate()

  return (
    <>
      <div className="Background"></div>
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__fadeInDown">
          <div className="FormWidget-body-logo"></div>
          <div className="Block">
            <div className="Block-header">Logout Success!</div>
            You have been successfully logged out.
            <div className="Button Button-color--yellow-1000 Margin-top--20">
              <div
                onClick={() => {
                  navigate("/login")
                }}
              >
                Login
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Logout
