import React, { useEffect, useState } from "react"
import { Formik, Form, Field } from "formik"
import Navbar from "../../components/Navbar"
import { api } from "../../api"
import Icon from "../../components/Icon"
import Modal from "../../components/Modal"
import MetaData from "../../components/MetaData"
import Event from "../../components/Event"
import { useNavigate } from "react-router-dom"
import TagFilter from "../../components/TagFilter"
import DateFilter from "../../components/DateFilter"
import { formatDate, formatTime } from "../../utils/formatters"
import { useAuth } from "../../context/AuthContext"

// Rename interface Event → EventData to avoid name clash with "Event" component
interface EventData {
  event_id: number
  o_id: number
  date: string
  people_needed: number
  location: string
  name: string
  time: string
  description: string
  tags: string[]
  image_url?: string
  link?: string
}

const Listings: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [orgMap, setOrgMap] = useState<{ [key: number]: string }>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [userRegistrations, setUserRegistrations] = useState<number[]>([]) // Array of event IDs the user is registered for
  const [selectedDates, setSelectedDates] = useState<{
    start: string | null
    end: string | null
  }>({
    start: null,
    end: null,
  })
  const [searchQuery, setSearchQuery] = useState("")

  const { user } = useAuth()
  const navigate = useNavigate()

  // Get unique tags from all events
  const availableTags = React.useMemo(() => {
    const tags = new Set<string>()
    events.forEach((event) => {
      event.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [events])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    // Fetch user's registrations when user is logged in
    if (user?.id) {
      fetchUserRegistrations()
    }
  }, [user])

  const fetchUserRegistrations = async () => {
    if (!user?.id) return
    try {
      const response = await api.get(`/registration/get-user-registrations/${user.id}`)
      const registeredEventIds = response.data.map((reg: any) => reg.event_id)
      setUserRegistrations(registeredEventIds)
    } catch (error) {
      console.error("Failed to fetch user registrations:", error)
    }
  }

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await api.get("/event/get-events")
      setEvents(response.data)
      // Fetch organization names
      response.data.forEach((evt: EventData) => {
        if (!orgMap[evt.o_id]) {
          fetchOrganization(evt.o_id)
        }
      })
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (values: { search: string }) => {
    setSearchQuery(values.search)
  }

  const fetchOrganization = async (o_id: number) => {
    try {
      const response = await api.get(`/organization/get-organization/${o_id}`)
      setOrgMap((prev) => ({ ...prev, [o_id]: response.data.org_name }))
    } catch (error) {
      console.error(`Error fetching organization ${o_id}`, error)
    }
  }

  const handleRegisterClick = async () => {
    if (selectedEvent) {
      // For external events, redirect to their link
      if (selectedEvent.tags?.includes("External")) {
        window.open(selectedEvent.link, '_blank');
        return;
      }

      if (!user) {
        console.error("User not logged in")
        navigate("/login")
        return
      }

      // Check if already registered
      if (userRegistrations.includes(selectedEvent.event_id)) {
        setRegistrationError("You are already registered for this event.")
        return
      }
      
      try {
        setRegistrationError(null)
        const registrationResponse = await api.post("/registration/create-registration", {
          v_id: user.id,
          event_id: selectedEvent.event_id,
        })

        if (registrationResponse.status === 201) {
          setRegistrationSuccess(true)
          // Add the event to userRegistrations
          setUserRegistrations(prev => [...prev, selectedEvent.event_id])
        }
      } catch (err) {
        console.error("Registration error details:", err)
        setRegistrationError("Failed to register for the event. Please try again.")
      }
    }
  }

  // Filter events based on selected tags, search and dates
  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = 
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      // Filter by tags
      if (selectedTags.length > 0) {
        if (!selectedTags.every((tag) => event.tags?.includes(tag))) {
          return false
        }
      }

      // Filter by date
      if (selectedDates.start || selectedDates.end) {
        const eventDate = new Date(event.date)
        if (selectedDates.start && eventDate < new Date(selectedDates.start)) {
          return false
        }
        if (selectedDates.end && eventDate > new Date(selectedDates.end)) {
          return false
        }
      }

      return true
    })
  }, [events, selectedTags, selectedDates, searchQuery])

  // Update the "See All" button handler
  const handleSeeAll = () => {
    setSearchQuery("")
    setSelectedTags([])
    setSelectedDates({ start: null, end: null })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Navbar />
      <MetaData title="Nashville Volunteers" description="Listings" />
      <div className="Listings">
        <div className="Flex--center Margin-top--16">
          <Icon 
            glyph="heart" 
            regular={true}
            size="72" 
            className="Text-color--red-1000 Margin-bottom--16" 
          />
        </div>
        <h1 className="Flex--center">Nashville Volunteers</h1>
        <div className="Flex--center">
          Discover meaningful volunteering opportunities in and around
          Nashville. Make a difference in your community today.
        </div>
        <div className="Flex--center Margin-top--20 Align-items--center">
          <div className="Search-container">
            <Formik initialValues={{ search: "" }} onSubmit={handleSubmit}>
              {({ errors, touched }) => (
                <Form className="Form-row">
                  <Field
                    className="Form-input-box"
                    type="text"
                    id="keyword"
                    name="search"
                    placeholder="Soup Kitchen, Animal Shelter, etc."
                  />
                  <button
                    type="submit"
                    className="Button Button-color--yellow-1000 Margin-left--10"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    className="Button Button-color--yellow-1000 Button--hollow Margin-left--10"
                    onClick={handleSeeAll}
                  >
                    See All
                  </button>
                </Form>
              )}
            </Formik>
            <div className="Filter-row">
              <TagFilter
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagSelect={(tag) => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }}
              />
              <DateFilter
                selectedDates={selectedDates}
                onDateChange={setSelectedDates}
              />
            </div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 Margin-top--20">
          {filteredEvents.length === 0 && !loading && (
            <div className="Width--100 Text--center">
              No volunteer opportunities match your criteria.
            </div>
          )}
          {filteredEvents.map((evt: EventData) => (
            <div key={evt.event_id} className="col">
              <Event
                event={evt}
                organizationName={orgMap[evt.o_id] || ""}
                onClick={() => setSelectedEvent(evt)}
                onOrganizationClick={() => navigate(`/organization/${evt.o_id}`)}
              />
            </div>
          ))}
        </div>
      </div>
      {selectedEvent && (
        <Modal
          header={selectedEvent.name}
          action={() => {
            setSelectedEvent(null)
            setRegistrationSuccess(false)
            setRegistrationError(null)
          }}
          large
          body={
            <div>
              {registrationSuccess ? (
                <div className="Registration-success">
                  <div className="Registration-success-icon">
                    <Icon
                      glyph="check-circle"
                      className="Text-color--green-1000"
                      size="48"
                    />
                  </div>
                  <h3>Successfully Registered!</h3>
                  <p>You have been registered for {selectedEvent.name}</p>
                  {selectedEvent && (
                    <a
                      href={(() => {
                        // Parse the date and time
                        const [year, month, day] = selectedEvent.date.split('-');
                        const [hours, minutes] = selectedEvent.time.split(':');
                        
                        // Create start date
                        const startDate = new Date(
                          parseInt(year),
                          parseInt(month) - 1, // Month is 0-based
                          parseInt(day),
                          parseInt(hours),
                          parseInt(minutes)
                        );
                        
                        // End date (1 hour later by default)
                        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                        
                        // Format dates for Google Calendar
                        const formatDate = (date: Date) => {
                          return date.toISOString().replace(/-|:|\.\d+/g, '');
                        };
                        
                        const startDateStr = formatDate(startDate);
                        const endDateStr = formatDate(endDate);
                        
                        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedEvent.name)}&details=${encodeURIComponent(selectedEvent.description)}&location=${encodeURIComponent(selectedEvent.location)}&dates=${startDateStr}/${endDateStr}`;
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="Button Button-color--yellow-1000 Margin-top--16"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Icon glyph="calendar" size="16" />
                      Add to Google Calendar
                    </a>
                  )}
                </div>
              ) : (
                <>
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
                  {registrationError && (
                    <div className="Alert Alert--error Margin-top--16">
                      {registrationError}
                    </div>
                  )}
                  <div className="Margin-top--20">
                    {userRegistrations.includes(selectedEvent.event_id) ? (
                      <div className="Button Button-color--gray-500 Cursor--not-allowed">
                        Already Registered
                      </div>
                    ) : (
                      <div
                        className="Button Button-color--blue-1000"
                        onClick={handleRegisterClick}
                      >
                        {selectedEvent.tags?.includes("External") 
                          ? `Register on ${orgMap[selectedEvent.o_id] || "External Site"}` 
                          : "Register for Event"}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          }
        />
      )}
    </>
  )
}

export default Listings
