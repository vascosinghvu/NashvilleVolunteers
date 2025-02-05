import React from "react"
import Navbar from "../components/Navbar"
import { useLocation } from "react-router-dom"

const Register = () => {
  const location = useLocation()
  const event = location.state?.event

  // Define types
  interface Event {
    event_id: number
    o_id: number
    date: string
    people_needed: number
    location: string
    name: string
    time: string
    description: string
    tags: string[]
  }

  interface Organization {
    o_id: number
    name: string
  }

  if (!event) {
    return <div>No event selected. Please go back and choose an event.</div>
  }

  return (
    <>
      <Navbar />
      <div className="Register">
        <div className="Block Register-block">
          <div className="Block-header">Register</div>
          <div className="Block-subtitle">Register for {event?.name}</div>
        </div>
      </div>
    </>
  )
}

export default Register
