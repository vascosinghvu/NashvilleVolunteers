import React, { useEffect, useState } from "react"
import { Formik, Form, Field } from "formik"
import Navbar from "../components/Navbar"
import { api } from "../api"
import Icon from "../components/Icon"
import Modal from "../components/Modal"
import MetaData from "../components/MetaData"
import Event from "../components/Event"
import { useNavigate } from "react-router-dom"
import TagFilter from "../components/TagFilter"

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
    setLoading(true)
    try {
      const response = await api.get(
        `/event/search-events?query=${values.search}`
      )
      setEvents(response.data)

      // Fetch organization names dynamically
      response.data.forEach((evt: EventData) => {
        if (!orgMap[evt.o_id]) {
          fetchOrganization(evt.o_id)
        }
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganization = async (o_id: number) => {
    try {
      const response = await api.get(`/organization/get-organization/${o_id}`)
      setOrgMap((prev) => ({ ...prev, [o_id]: response.data.name }))
    } catch (error) {
      console.error(`Error fetching organization ${o_id}`, error)
    }
  }

  const handleRegisterClick = () => {
    if (selectedEvent) {
      navigate("/register", { state: { event: selectedEvent } })
    }
  }

  // Filter events based on selected tags and search
  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      // Filter by tags if any are selected
      if (selectedTags.length > 0) {
        return selectedTags.every((tag) => event.tags?.includes(tag))
      }
      return true
    })
  }, [events, selectedTags])

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
          action={() => setSelectedEvent(null)}
          large
          body={
            <div>
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="calendar"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Date:</strong>
                </span>
                {selectedEvent.date}
              </div>
              <div className="Event-modal-line">
                <span>
                  <Icon
                    glyph="clock"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Time:</strong>
                </span>
                {selectedEvent.time}
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
                className="Button Button-color--blue-1000 Margin-top--20"
                onClick={handleRegisterClick}
              >
                Register for Event
              </div>
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
                </Form>
              )}
            </Formik>
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
