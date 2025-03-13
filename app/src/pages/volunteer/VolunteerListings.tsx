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
}

const Listings: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [orgMap, setOrgMap] = useState<{ [key: number]: string }>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)
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
      setOrgMap((prev) => ({ ...prev, [o_id]: response.data.name }))
    } catch (error) {
      console.error(`Error fetching organization ${o_id}`, error)
    }
  }

  const handleRegisterClick = async () => {
    if (selectedEvent) {
      if (!user) {
        console.error("User not logged in")
        navigate("/login")
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
          // Reset success message after 3 seconds
          setTimeout(() => {
            setRegistrationSuccess(false)
            setSelectedEvent(null)
          }, 3000)
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
                  <div
                    className="Button Button-color--blue-1000 Margin-top--20"
                    onClick={handleRegisterClick}
                  >
                    Register for Event
                  </div>
                </>
              )}
            </div>
          }
        />
      )}
      <div className="Listings">
        <h1 className="Flex--center Margin-top--40">Nashville Volunteers</h1>
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
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Listings
