import React, { useState, type ReactElement } from "react"
import { Formik, Form, Field } from "formik"
import Navbar from "../components/Navbar"
import { api } from "../api"
import Icon from "../components/Icon"
import Modal from "../components/Modal"

// Define the event type
interface Event {
  event_id: number
  o_id: number
  date: string
  people_needed: number
  location: string
  name: string
  time: string
  description: string
}

const Listings = (): ReactElement => {
  // create a loading state variable
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([]) // Typed state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Handle form submission (unchanged as per request)
  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await api.get(`/event/get-events`)
      setEvents(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      {selectedEvent && (
        <Modal
          header={selectedEvent.name} // ✅ Corrected prop name
          action={() => setSelectedEvent(null)} // ✅ Added action prop to close modal
          body={
            <div>
              <div>
                <Icon glyph="calendar" /> {selectedEvent.date}
              </div>
              <div>
                <Icon glyph="clock" /> {selectedEvent.time}
              </div>
              <div>
                <Icon glyph="location" /> {selectedEvent.location}
              </div>
              <div>
                <Icon glyph="people" /> {selectedEvent.people_needed}
              </div>
              <div>
                <Icon glyph="description" /> {selectedEvent.description}
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
          <Formik initialValues={{ search: "" }} onSubmit={handleSubmit}>
            {({ errors, touched }) => (
              <Form className="Form-row Width--100">
                <Field
                  className="Form-input-box"
                  type="text"
                  id="keyword"
                  name="search"
                  placeholder="Soup Kitchen, Animal Shelter, etc."
                />
                <button
                  type="submit"
                  className="Button Button--small Button-color--pink-1000 Margin-left--10"
                >
                  Search
                </button>
                {errors.search && touched.search && (
                  <div className="Form-error">{errors.search}</div>
                )}
              </Form>
            )}
          </Formik>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 Margin-top--20">
          {events.map((event: Event) => (
            <div
              key={event.event_id}
              className="col"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="Event">
                <div className="Event-color"></div>
                <div className="Event-text">
                  <div className="Event-text-title">{event.name}</div>
                  {event.o_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Listings
