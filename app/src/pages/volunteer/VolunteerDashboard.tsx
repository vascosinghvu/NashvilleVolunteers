import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar"
import Event from "../../components/Event"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Modal from "../../components/Modal"
import Icon from "../../components/Icon"
import { formatDate, formatTime } from "../../utils/formatters"
import { getEventStatus } from "../../utils/eventStatus"

interface EventData {
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

interface UserProfile {
  first_name: string
  last_name: string
  phone_number: string
  email: string
  image_url?: string
  age: number
}

const VolunteerDashboard: React.FC = () => {
  const [registeredEvents, setRegisteredEvents] = useState<EventData[]>([])
  const [orgMap, setOrgMap] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Separate active and past events
  const { activeEvents, pastEvents } = registeredEvents.reduce((acc, event) => {
    const status = getEventStatus(event.date);
    if (status === 'past') {
      acc.pastEvents.push(event);
    } else {
      acc.activeEvents.push(event);
    }
    return acc;
  }, { activeEvents: [] as EventData[], pastEvents: [] as EventData[] });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Fetch user profile
        const profileResponse = await api.get(`/volunteer/get-volunteer/${user.id}`);
        setUserProfile(profileResponse.data);
        
        // Fetch registered events
        await fetchRegisteredEvents();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fetchRegisteredEvents = async () => {
    if (!user?.id) return
    
    try {
      // First get all registrations for this volunteer
      const registrationsResponse = await api.get(`/registration/get-user-registrations/${user.id}`)
      
      // Then get the event details for each registration
      const eventPromises = registrationsResponse.data.map(async (registration: any) => {
        const eventResponse = await api.get(`/event/get-event/${registration.event_id}`)
        return eventResponse.data
      })

      const events = await Promise.all(eventPromises)
      setRegisteredEvents(events)

      // Fetch organization names
      events.forEach((event: EventData) => {
        if (!orgMap[event.o_id]) {
          fetchOrganization(event.o_id)
        }
      })
    } catch (error) {
      console.error("Failed to fetch registered events:", error)
    }
  }

  const fetchOrganization = async (o_id: number) => {
    try {
      const response = await api.get(`/organization/get-organization/${o_id}`)
      setOrgMap((prev) => ({ ...prev, [o_id]: response.data.org_name }))
    } catch (error) {
      console.error(`Error fetching organization ${o_id}:`, error)
    }
  }

  const handleUnregister = async () => {
    if (selectedEvent && user?.id) {
      try {
        await api.delete(`/registration/delete-registration/${user.id}/${selectedEvent.event_id}`)
        setSelectedEvent(null)
        // Refresh the events list
        fetchRegisteredEvents()
      } catch (error) {
        console.error("Failed to unregister from event:", error)
      }
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="Dashboard">
          <div className="Dashboard-welcome">
            <h1 className="Dashboard-welcome-title">Loading...</h1>
          </div>
        </div>
      </>
    )
  }

  const renderEventSection = (events: EventData[], title: string) => (
    <div className="Dashboard-events">
      <div className="Dashboard-events-header">
        <div className="Dashboard-events-header-left">
          <h2 className="Dashboard-events-header-left-title">{title}</h2>
          <div className="Dashboard-events-header-left-divider"></div>
        </div>
      </div>

      <div className="Dashboard-events-grid">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {events.map((event) => (
            <div key={event.event_id} className="col">
              <Event
                event={event}
                organizationName={orgMap[event.o_id]}
                onClick={() => setSelectedEvent(event)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="Dashboard">
        <div className="Dashboard-welcome">
          <h1 className="Dashboard-welcome-title">
            {userProfile ? `${userProfile.first_name}'s` : 'Your'} Volunteer Dashboard
          </h1>
          <p className="Dashboard-welcome-subtitle">
            View and manage your registered events
          </p>
        </div>

        <div className="Dashboard-events-header-actions Margin-bottom--32">
          <button
            onClick={() => navigate("/listings")}
            className="Button Button-color--yellow-1000"
          >
            Find More Events
          </button>
          <button
            onClick={() => navigate("/volunteer/profile")}
            className="Button Button-color--gray-1000"
          >
            Manage Profile
          </button>
        </div>

        {registeredEvents.length === 0 ? (
          <div className="Width--100 Text--center">
            <p>You haven't registered for any events yet.</p>
            <button
              onClick={() => navigate("/listings")}
              className="Button Button-color--blue-1000 Margin-top--20"
            >
              Browse Available Events
            </button>
          </div>
        ) : (
          <>
            {activeEvents.length > 0 && renderEventSection(activeEvents, "Active Events")}
            {pastEvents.length > 0 && renderEventSection(pastEvents, "Past Events")}
          </>
        )}
      </div>

      {selectedEvent && (
        <Modal
          header={selectedEvent.name}
          action={() => setSelectedEvent(null)}
          large
          body={
            <div>
              {selectedEvent.image_url && (
                <div className="Event-modal-image">
                  <img src={selectedEvent.image_url} alt={selectedEvent.name} />
                </div>
              )}
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="calendar"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Date:</strong>
                </span>
                {formatDate(selectedEvent.date)}
              </div>
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="clock"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Time:</strong>
                </span>
                {formatTime(selectedEvent.time)}
              </div>
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="location"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Location:</strong>
                </span>
                {selectedEvent.location}
              </div>
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="users"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Volunteers Needed:</strong>
                </span>
                {selectedEvent.people_needed}
              </div>
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="info-circle"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Description:</strong>
                </span>
                {selectedEvent.description}
              </div>
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="building"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Organization:</strong>
                </span>
                {orgMap[selectedEvent.o_id] || "Loading..."}
              </div>
              <div
                className="Button Button-color--red-1000 Margin-top--20"
                onClick={handleUnregister}
              >
                Unregister from Event
              </div>
            </div>
          }
        />
      )}
    </>
  )
}

export default VolunteerDashboard
