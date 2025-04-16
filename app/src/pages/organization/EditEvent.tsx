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
import Modal from "../../components/Modal"

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
  phone_number: string
  email: string
  skills?: string[]
  interests?: string[]
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Event name is required"),
  description: yup.string().required("Description is required"),
  date: yup.date().required("Date is required"),
  time: yup.string().required("Time is required"),
  location: yup.string().required("Location is required"),
  people_needed: yup
    .number()
    .min(1, "At least one volunteer is needed")
    .required("Number of volunteers needed is required"),
})

const EditEvent: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [pendingVolunteers, setPendingVolunteers] = useState<VolunteerData[]>(
    []
  )
  const [registeredVolunteers, setRegisteredVolunteers] = useState<
    VolunteerData[]
  >([])
  const [initialValues, setInitialValues] = useState<EventFormValues>({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    people_needed: 1,
    tags: [],
    image_url: "",
    restricted: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerData | null>(null)

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
        const formattedDate = new Date(eventData.date)
          .toISOString()
          .split("T")[0]

        setInitialValues({
          name: eventData.name,
          description: eventData.description,
          date: formattedDate,
          time: eventData.time,
          location: eventData.location,
          people_needed: eventData.people_needed,
          tags: eventData.tags.join(", ") || "",
          image_url: eventData.image_url,
          restricted: eventData.restricted,
        })
        setImagePreview(eventData.image_url || "")

        // Fetch volunteer registrations
        const registrationsResponse = await api.get(
          `/registration/get-event-registrations/${eventId}`
        )
        const registrations = registrationsResponse.data

        // Fetch volunteer details for each registration
        const volunteerPromises = registrations.map((reg: any) =>
          api.get(`/volunteer/get-volunteer/${reg.v_id}`)
        )
        const volunteerResponses = await Promise.all(volunteerPromises)
        const volunteerData = volunteerResponses.map(
          (response) => response.data
        )

        if (eventData.restricted) {
          setPendingVolunteers(
            volunteerData.filter(
              (volunteer, index) => !registrations[index].approved
            )
          )
          setRegisteredVolunteers(
            volunteerData.filter(
              (volunteer, index) => registrations[index].approved
            )
          )
        } else {
          setRegisteredVolunteers(volunteerData)
        }

        console.log(volunteerData, "volunteerData")

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

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Create FormData for image upload
      const formData = new FormData()
      formData.append("image", file)

      // Upload the image
      const response = await api.put(
        `/event/update-event/${eventId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.status === 200) {
        setImagePreview(URL.createObjectURL(file))
      }
    } catch (err) {
      console.error("Failed to upload image:", err)
      setError("Failed to upload image")
    }
  }

  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000) // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy email:", err)
      })
  }

  const handleApproveVolunteer = async (volunteer: VolunteerData) => {
    try {
      await api.put(
        `/registration/approve-volunteer/${eventId}/${volunteer.v_id}`
      )
      setRegisteredVolunteers((prev) => [...prev, volunteer])
      setPendingVolunteers((prev) =>
        prev.filter((v) => v.v_id !== volunteer.v_id)
      )
    } catch (err) {
      console.error("Failed to approve volunteer:", err)
    }
  }

  const handleRejectVolunteer = async (volunteer: VolunteerData) => {
    try {
      await api.delete(
        `/registration/delete-registration/${volunteer.v_id}/${eventId}`
      )
      setPendingVolunteers((prev) =>
        prev.filter((v) => v.v_id !== volunteer.v_id)
      )
    } catch (err) {
      console.error("Failed to reject volunteer:", err)
    }
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

      {showInfoModal && selectedVolunteer && (
        <Modal
          header={`${selectedVolunteer.first_name}'s profile`}
          action={() => setShowInfoModal(false)}
          body={
            <div>
              {/* Name */}
              <div className="Event-modal-line">
                <Icon
                  glyph="user"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Name:</strong>
                <span className="Margin-left--8">
                  {selectedVolunteer.first_name} {selectedVolunteer.last_name}
                </span>
              </div>

              {/* Email */}
              <div className="Event-modal-line">
                <Icon
                  glyph="envelope"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Email:</strong>
                <span className="Margin-left--8">
                  {selectedVolunteer.email}
                </span>
              </div>

              {/* Phone */}
              <div className="Event-modal-line">
                <Icon
                  glyph="phone"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Phone:</strong>
                <span className="Margin-left--8">
                  {selectedVolunteer.phone_number || "N/A"}
                </span>
              </div>

              {/* Skills */}
              <div
                className="Event-modal-line"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--nash-color-gray-300)",
                  textAlign: "right",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "150px",
                    whiteSpace: "nowrap",
                    flexGrow: 1,
                  }}
                >
                  <Icon
                    glyph="check-circle"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Skills:</strong>
                </span>
              </div>
              <div className="Flex-wrap--tags Margin-bottom--16">
                {selectedVolunteer?.skills?.length ? (
                  selectedVolunteer.skills.map((s) => (
                    <span key={s} className="Filter-tag">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="Text-color--gray-600">No skills listed</span>
                )}
              </div>

              {/* Interests */}
              <div
                className="Event-modal-line"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--nash-color-gray-300)",
                  textAlign: "right",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "150px",
                    whiteSpace: "nowrap",
                    flexGrow: 1,
                  }}
                >
                  <Icon
                    glyph="heart"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Interests:</strong>
                </span>
              </div>
              <div className="Flex-wrap--tags">
                {selectedVolunteer?.interests?.length ? (
                  selectedVolunteer.interests.map((i) => (
                    <span key={i} className="Filter-tag">
                      {i}
                    </span>
                  ))
                ) : (
                  <span className="Text-color--gray-600">
                    No interests listed
                  </span>
                )}
              </div>

              {/* Close button */}
              <div className="Margin-top--20 Flex-row Justify-content--end">
                <button
                  className="Button Button-color--blue-1000 Width--100"
                  onClick={() => setShowInfoModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          }
        />
      )}

      <div className="container py-4">
        <div className="row">
          <div
            className="col-lg-12 mb-4"
            onClick={() => navigate("/organization/dashboard")}
            style={{ cursor: "pointer" }}
          >
            <Icon glyph="chevron-left" className="Text-colorHover--teal-1000" />
          </div>
          {/* Event Form */}
          <div className="col-lg-4">
            <div className="Block">
              <div className="Block-header">Event Details</div>
              <div className="Block-subtitle">
                Update your event details below.
              </div>
              <div className="Block-body">
                {error && (
                  <div className="Form-error Margin-bottom--16">{error}</div>
                )}
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ errors, touched, isValid, isSubmitting }) => (
                    <Form>
                      <div className="Form-group">
                        <label>Event Image</label>
                        <div
                          className="Flex--center"
                          onClick={handleImageClick}
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Event"
                              className="Profile-preview"
                            />
                          ) : (
                            <div className="Text-color--gray-600 text-center">
                              <Icon glyph="image" size="32" />
                              <div className="Margin-top--8">
                                Click to upload image
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: "none" }}
                        />
                      </div>

                      {[
                        { name: "name", type: "text", label: "Event Name" },
                        {
                          name: "description",
                          type: "textarea",
                          label: "Description",
                        },
                        { name: "date", type: "date", label: "Date" },
                        { name: "time", type: "time", label: "Time" },
                        { name: "location", type: "text", label: "Location" },
                        {
                          name: "people_needed",
                          type: "number",
                          label: "Volunteers Needed",
                        },
                        { name: "tags", type: "text", label: "Tags" },
                      ].map(({ name, type, label }) => (
                        <div key={name} className="Form-group">
                          <label htmlFor={name}>{label}</label>
                          <Field
                            as={type === "textarea" ? "textarea" : "input"}
                            type={type}
                            name={name}
                            className="Form-input-box"
                            placeholder={label}
                            rows={type === "textarea" ? 4 : undefined}
                            min={type === "number" ? 1 : undefined}
                          />
                          {/* {errors[name] && touched[name] && (
                            <div className="Form-error">{errors[name]}</div>
                          )} */}
                        </div>
                      ))}

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

                      <div className="flex space-x-4 Margin-top--24">
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
          </div>

          {/* Registered Volunteers */}
          <div className="col-lg-4">
            <div className="Block">
              <div className="Block-header">Registered Volunteers</div>
              <div className="Block-subtitle">
                {registeredVolunteers.length}/{initialValues.people_needed}{" "}
                registered
              </div>
              <div className="Block-body">
                {registeredVolunteers.length === 0 ? (
                  <p className="Text-color--gray-600">No registrations yet.</p>
                ) : (
                  registeredVolunteers.map((vol) => (
                    <div
                      key={vol.v_id}
                      className="Volunteer-card Volunteer-card--approved"
                      onClick={() => {
                        setShowInfoModal(true)
                        setSelectedVolunteer(vol)
                      }}
                    >
                      <div className="Volunteer-avatar">
                        <Icon glyph="user" size="24" />
                      </div>
                      <div className="Volunteer-details">
                        <div className="Volunteer-name">
                          {vol.first_name} {vol.last_name}
                        </div>
                        <div className="Volunteer-contact">
                          <span
                            onClick={() => handleCopyEmail(vol.email, vol.v_id)}
                            className="Icon-click"
                          >
                            <Icon
                              glyph={copiedId === vol.v_id ? "check" : "copy"}
                              size="14"
                              className="Text-color--royal-800"
                            />
                          </span>
                          <span className="Text-size--14 Text-color--gray-600">
                            {vol.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pending Volunteers */}
          <div className="col-lg-4">
            <div className="Block">
              <div className="Block-header">Pending Volunteers</div>
              <div className="Block-subtitle">
                {pendingVolunteers.length} Pending Requests
              </div>
              <div className="Block-body">
                {pendingVolunteers.length === 0 ? (
                  <p className="Text-color--gray-600">No pending requests.</p>
                ) : (
                  pendingVolunteers.map((vol) => (
                    <div
                      key={vol.v_id}
                      className="Volunteer-card Volunteer-card--pending"
                      onClick={() => {
                        setShowInfoModal(true)
                        setSelectedVolunteer(vol)
                      }}
                    >
                      <div className="Flex-column Width--100">
                        <div className="Flex-row">
                          <div className="Volunteer-avatar">
                            <Icon glyph="user" size="24" />
                          </div>
                          <div className="Volunteer-details">
                            <div className="Volunteer-name">
                              {vol.first_name} {vol.last_name}
                            </div>
                            <div className="Volunteer-contact">
                              <span
                                onClick={() =>
                                  handleCopyEmail(vol.email, vol.v_id)
                                }
                                className="Icon-click"
                              >
                                <Icon
                                  glyph={
                                    copiedId === vol.v_id ? "check" : "copy"
                                  }
                                  size="14"
                                  className="Text-color--royal-800"
                                />
                              </span>
                              <span className="Text-size--14 Text-color--gray-600">
                                {vol.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="Flex-row Width--100 Margin-top--10">
                          <button
                            className="Button Button-color--green-1000 Button--small Width--100 Margin-right--4"
                            onClick={() => handleApproveVolunteer(vol)}
                          >
                            Approve
                          </button>
                          <button
                            className="Button Button-color--red-1000 Button--small Width--100 Margin-left--4"
                            onClick={() => handleRejectVolunteer(vol)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditEvent
