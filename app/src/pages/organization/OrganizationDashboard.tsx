import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Event from "../../components/Event"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"

interface Event {
  event_id: number
  name: string
  description: string
  date: string
  time: string
  location: string
  people_needed: number
  o_id: number
  image_url?: string
  tags: string[]
}

const OrganizationDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [orgName, setOrgName] = useState<string>("")
  const { user } = useAuth()
  const navigate = useNavigate()

  // Create a placeholder event for the "Create New" button
  useEffect(() => {
    fetchOrganizationEvents()
    fetchOrgName()
  }, [])

  const fetchOrgName = async () => {
    try {
      if (!user?.id) return
      const response = await api.get(
        `/organization/get-organization/${user.id}`
      )
      setOrgName(response.data.org_name)
    } catch (error) {
      console.error("Failed to fetch organization:", error)
    }
  }

  const fetchOrganizationEvents = async () => {
    try {
      if (!user?.id) return
      const response = await api.get(`/event/organization/${user.id}`)
      const eventsWithNumberId = response.data.map((event: any) => ({
        ...event,
        o_id: Number(event.o_id),
      }))
      setEvents(eventsWithNumberId)
    } catch (error) {
      console.error("Failed to fetch events:", error)
    }
  }

  return (
    <>
      <Navbar />
      <div className="Dashboard">
        <div className="Dashboard-welcome">
          <h1 className="Dashboard-welcome-title">Welcome back, {orgName}</h1>
          <p className="Dashboard-welcome-subtitle">
            Manage your events and organization profile from here.
          </p>
        </div>

        <div className="Dashboard-events">
          <div className="Dashboard-events-header">
            <div className="Dashboard-events-header-left">
              <div className="Dashboard-events-header-left-title">
                <span className="Text-fontSize--24 Text--bold">
                  Your Events
                </span>
                <button
                  onClick={() => navigate("/organization/create-event")}
                  className="Button Button-color--blue-1000"
                >
                  Create New Event
                </button>
              </div>
              <div className="Dashboard-events-header-left-divider"></div>
            </div>
          </div>

          <div className="Dashboard-events-grid">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {events.map((event) => (
                <div key={event.event_id} className="col">
                  <Event
                    event={event}
                    onClick={() =>
                      navigate(`/organization/edit-event/${event.event_id}`)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrganizationDashboard
