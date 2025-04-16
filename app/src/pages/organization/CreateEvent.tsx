import React, { useState } from "react"
import { Formik, Form, Field } from "formik"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Navbar from "../../components/Navbar"
import MetaData from "../../components/MetaData"
import * as yup from "yup"
import { Form as BootstrapForm } from "react-bootstrap"

interface EventFormValues {
  name: string
  description: string
  date: string
  time: string
  location: string
  people_needed: number
  tags: string[]
  restricted: boolean
}

const initialValues: EventFormValues = {
  name: "",
  description: "",
  date: "",
  time: "",
  location: "",
  people_needed: 1,
  tags: [],
  restricted: false,
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Event name is required"),
  description: yup.string().required("Description is required"),
  date: yup
    .date()
    .min(new Date(), "Event date must be in the future")
    .required("Date is required"),
  time: yup.string().required("Time is required"),
  location: yup.string().required("Location is required"),
  people_needed: yup
    .number()
    .min(1, "At least one volunteer is needed")
    .required("Number of volunteers needed is required"),
})

const CreateEvent: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>("")

  const handleSubmit = async (values: EventFormValues) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      const payload = {
        o_id: user.id,
        ...values,
      }

      console.log("Submitting event with data:", payload)
      console.log(
        "API URL:",
        `${process.env.REACT_APP_API_URL}/event/create-event`
      )

      const response = await api.post("/event/create-event", payload)

      console.log("Response:", response)

      if (response.status === 201) {
        navigate("/organization/dashboard")
      } else {
        throw new Error(`Failed to create event: ${response.status}`)
      }
    } catch (err) {
      console.error("Event creation error details:", err)
      setError(err instanceof Error ? err.message : "Failed to create event")
    }
  }

  return (
    <>
      <Navbar />
      <MetaData
        title="Create Event - Nashville Volunteers"
        description="Create a new volunteer event"
      />
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__slideInDown">
          <div className="Block">
            <div className="Block-header">Create New Event</div>

            {error && <div className="Form-error">{error}</div>}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, dirty, isSubmitting }) => (
                <Form>
                  <div className="Form-group">
                    <label htmlFor="name">Event Name</label>
                    <Field
                      type="text"
                      name="name"
                      className="Form-input-box"
                      placeholder="Enter event name"
                    />
                    {errors.name && touched.name && (
                      <div className="Form-error">{errors.name}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="description">Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      className="Form-input-box"
                      placeholder="Describe your event"
                      rows={4}
                    />
                    {errors.description && touched.description && (
                      <div className="Form-error">{errors.description}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="date">Date</label>
                    <Field
                      type="date"
                      name="date"
                      className="Form-input-box"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.date && touched.date && (
                      <div className="Form-error">{errors.date}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="time">Time</label>
                    <Field type="time" name="time" className="Form-input-box" />
                    {errors.time && touched.time && (
                      <div className="Form-error">{errors.time}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="location">Location</label>
                    <Field
                      type="text"
                      name="location"
                      className="Form-input-box"
                      placeholder="Enter event location"
                    />
                    {errors.location && touched.location && (
                      <div className="Form-error">{errors.location}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="people_needed">
                      Number of Volunteers Needed
                    </label>
                    <Field
                      type="number"
                      name="people_needed"
                      className="Form-input-box"
                      min="1"
                    />
                    {errors.people_needed && touched.people_needed && (
                      <div className="Form-error">{errors.people_needed}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="tags">Tags</label>
                    <Field
                      type="text"
                      name="tags"
                      className="Form-input-box"
                      placeholder="Enter tags separated by commas"
                    />
                    {errors.tags && touched.tags && (
                      <div className="Form-error">{errors.tags}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="restricted">Restricted</label>
                    <Field
                      as={BootstrapForm.Check}
                      type="switch"
                      name="restricted"
                      className="Form-input-box"
                    />
                    {errors.restricted && touched.restricted && (
                      <div className="Form-error">{errors.restricted}</div>
                    )}
                  </div>

                  <div className="Flex-row">
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="Button Button-color--gray-500 Width--100 Margin-right--4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="Button Button-color--blue-1000 Width--100 Margin-left--4"
                      disabled={isSubmitting || !isValid || !dirty}
                    >
                      {isSubmitting ? "Creating Event..." : "Create Event"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateEvent
