import React, { useState, type ReactElement } from "react"
import { Formik, Form, Field } from "formik"
import Navbar from "../components/Navbar"
import { api } from "../api"
import Icon from "../components/Icon"

// Define the event type
interface Event {
  event_id: number
  o_id: number
  event_date: string
  people_needed: number
  location: string
}

const Listings = (): ReactElement => {
  // create a loading state variable
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([]) // Typed state

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
      </div>

      <div className="Listings-events">
        {events.map((event: Event) => (
          <div key={event.event_id} className="Card">
            <p>
              <strong>People Needed:</strong> {event.people_needed}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(event.event_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
            <div className="Event-card-footer">
              <button className="Button Button--small Button-color--pink-1000">
                Register
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Listings
