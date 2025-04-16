import React, { useState, useEffect, useRef } from "react"
import { Formik, Form, Field } from "formik"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Navbar from "../../components/Navbar"
import MetaData from "../../components/MetaData"
import Icon from "../../components/Icon"
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
  image_url?: string
  restricted: boolean
}

interface VolunteerData {
  v_id: number
  first_name: string
  last_name: string
  email: string
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Event name is required"),
  description: yup.string().required("Description is required"),
  date: yup.date()
    .required("Date is required"),
  time: yup.string().required("Time is required"),
  location: yup.string().required("Location is required"),
  people_needed: yup.number()
    .min(1, "At least one volunteer is needed")
    .required("Number of volunteers needed is required"),
})

const EditEvent: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([])
  const [initialValues, setInitialValues] = useState<EventFormValues>({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    people_needed: 1,
    tags: [],
    image_url: "",
    restricted: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchEventAndVolunteers = async () => {
      try {
        if (!eventId) {
          throw new Error("Event ID not provided")
        }

        // Fetch event data
        const eventResponse = await api.get(`/event/get-event/${eventId}`)
        const eventData = eventResponse.data

        // Format the date to YYYY-MM-DD
        const formattedDate = new Date(eventData.date).toISOString().split('T')[0]

        setInitialValues({
          name: eventData.name,
          description: eventData.description,
          date: formattedDate,
          time: eventData.time,
          location: eventData.location,
          people_needed: eventData.people_needed,
          tags: eventData.tags.join(', ') || "",
          image_url: eventData.image_url,
          restricted: eventData.restricted
        })
        setImagePreview(eventData.image_url || "")

        // Fetch volunteer registrations
        const registrationsResponse = await api.get(`/registration/get-event-registrations/${eventId}`)
        const registrations = registrationsResponse.data

        // Fetch volunteer details for each registration
        const volunteerPromises = registrations.map((reg: any) =>
          api.get(`/volunteer/get-volunteer/${reg.v_id}`)
        )
        const volunteerResponses = await Promise.all(volunteerPromises)
        const volunteerData = volunteerResponses.map(response => response.data)
        setVolunteers(volunteerData)

        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load event data")
        setLoading(false)
      }
    }

    fetchEventAndVolunteers()
  }, [eventId])

  const handleSubmit = async (values: EventFormValues) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      if (!eventId) {
        throw new Error("Event ID not provided")
      }

      const payload = {
        o_id: user.id,
        ...values,
      }

      const response = await api.put(`/event/update-event/${eventId}`, payload)

      if (response.status === 200) {
        navigate("/organization/dashboard")
      } else {
        throw new Error(`Failed to update event: ${response.status}`)
      }
    } catch (err) {
      console.error("Event update error:", err)
      setError(err instanceof Error ? err.message : "Failed to update event")
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Create FormData for image upload
      const formData = new FormData()
      formData.append('image', file)

      // Upload the image
      const response = await api.put(`/event/update-event/${eventId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 200) {
        setImagePreview(URL.createObjectURL(file))
      }
    } catch (err) {
      console.error("Failed to upload image:", err)
      setError("Failed to upload image")
    }
  }

  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email)
      .then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000) // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy email:', err)
      })
  }


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="Dashboard">
          <div className="Dashboard-welcome">
            <h1 className="Dashboard-welcome-title">Loading event data...</h1>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <MetaData
        title="Edit Event - Nashville Volunteers"
        description="Edit volunteer event"
      />
      <div className="Dashboard">
        <div className="Dashboard-welcome">
          <h1 className="Dashboard-welcome-title">Edit Event</h1>
          <p className="Dashboard-welcome-subtitle">Update your event details below.</p>
        </div>

        {error && (
          <div className="Form-error Margin-bottom--16">{error}</div>
        )}

        <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
          <div style={{ flex: '0 0 65%' }}>
            <div className="Block">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ errors, touched, isValid, isSubmitting }) => (
                  <Form>
                    <div className="Form-group Margin-bottom--24">
                      <label>Event Image</label>
                      <div 
                        onClick={handleImageClick}
                        style={{ 
                          cursor: 'pointer',
                          position: 'relative',
                          width: '400px',
                          height: '250px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed #ccc'
                        }}
                      >
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Event" 
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <div className="Text-color--gray-600">
                            <Icon glyph="image" size="32" />
                            <div className="Margin-top--8">Click to upload image</div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </div>

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
                      />
                      {errors.date && touched.date && (
                        <div className="Form-error">{errors.date}</div>
                      )}
                    </div>

                    <div className="Form-group">
                      <label htmlFor="time">Time</label>
                      <Field
                        type="time"
                        name="time"
                        className="Form-input-box"
                      />
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
                      <label htmlFor="people_needed">Number of Volunteers Needed</label>
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
                        as={BootstrapForm.Switch}
                        name="restricted"
                        className="Form-input-box"
                        defaultChecked={initialValues.restricted}
                      />
                      {errors.restricted && touched.restricted && (
                        <div className="Form-error">{errors.restricted}</div>
                      )}
                    </div>

                    <div className="flex space-x-4 Margin-top--32">
                      <button
                        type="button"
                        onClick={() => navigate("/organization/dashboard")}
                        className="Button Button-color--gray-500 Width--50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="Button Button-color--blue-1000 Width--50"
                        disabled={isSubmitting || !isValid}
                      >
                        {isSubmitting ? "Updating Event..." : "Update Event"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          <div style={{ flex: '0 0 32%' }}>
            <div className="Block" style={{ position: 'sticky', top: '24px' }}>
              <h2 className="Text-size--16 Font-weight--600 Text-color--dark-800 Margin-bottom--16">
                Registered Volunteers ({volunteers.length}/{initialValues.people_needed})
              </h2>
              {volunteers.length === 0 ? (
                <p className="Text-color--gray-600">No volunteers have registered for this event yet.</p>
              ) : (
                <div className="space-y-2">
                  {volunteers.map((volunteer) => (
                    <div 
                      key={volunteer.v_id} 
                      className="px-6 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col items-center text-center px-2">
                        <div className="bg-gray-50 p-2 rounded-full Margin-bottom--8">
                          <Icon glyph="user" size="20" className="Text-color--royal-800" />
                        </div>
                        <div className="Font-weight--600 Text-color--dark-800 Margin-bottom--4">
                          {volunteer.first_name} {volunteer.last_name}
                        </div>
                        <div style={{ width: '85%', margin: '0 auto' }} className="flex items-center">
                          <span 
                            onClick={() => handleCopyEmail(volunteer.email, volunteer.v_id)}
                            className="cursor-pointer hover:scale-110 transition-transform duration-200 flex items-center"
                            style={{ marginRight: '12px' }}
                          >
                            <Icon 
                              glyph={copiedId === volunteer.v_id ? "check" : "copy"} 
                              size="14" 
                              className="Text-color--royal-800"
                            />
                          </span>
                          <span className="Text-size--14 Text-color--gray-600">
                            {volunteer.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditEvent 