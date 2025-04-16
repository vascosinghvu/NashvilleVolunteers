import React, { useEffect, useState, useRef } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import Navbar from "../../components/Navbar"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Icon from "../../components/Icon"
import { Spinner } from "react-bootstrap"
import { resizeImage } from "../../utils/imageUtils"
import Modal from "../../components/Modal"

interface ProfileProps {
  first_name: string
  last_name: string
  phone_number: string
  image_url: string
  age: number
  email: string
  skills: string[]
  interests: string[]
  availability: {
    [day: string]: {
      mornings: boolean
      afternoons: boolean
      evenings: boolean
    }
  }
  experience: {
    years: number
    description: string
  }
}

const MAX_IMAGE_SIZE = 400 // Reduced maximum width/height in pixels for better file size

// Add these constants after the ProfileSchema
const SKILLS_OPTIONS = [
  "First Aid/CPR",
  "Teaching/Tutoring",
  "Construction",
  "Cooking",
  "Event Planning",
  "Fundraising",
  "Graphic Design",
  "Marketing",
  "Photography",
  "Public Speaking",
  "Social Media",
  "Translation",
  "Web Development",
  "Writing/Editing",
  "Other",
]

const INTERESTS_OPTIONS = [
  "Animal Welfare",
  "Arts & Culture",
  "Children & Youth",
  "Community Development",
  "Education",
  "Environment",
  "Food Security",
  "Health & Wellness",
  "Homelessness",
  "Human Rights",
  "Immigration",
  "LGBTQ+ Rights",
  "Mental Health",
  "Poverty Alleviation",
  "Senior Care",
  "Veterans",
  "Other",
]

const Profile = () => {
  const { user } = useAuth()
  const [userData, setUserData] = useState<ProfileProps>()
  const [loading, setLoading] = useState(true)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showInterestsModal, setShowInterestsModal] = useState(false)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      if (!user) return
      try {
        console.log("Fetching user profile for:", user.id)
        const response = await api.get(`/volunteer/get-volunteer/${user.id}`)
        const data = response.data

        // Parse JSONB fields if they exist
        const parsedData = {
          ...data,
          skills: data.skills ? JSON.parse(data.skills) : [],
          interests: data.interests ? JSON.parse(data.interests) : [],
          availability: data.availability
            ? JSON.parse(data.availability)
            : {
                weekdays: false,
                weekends: false,
                mornings: false,
                afternoons: false,
                evenings: false,
              },
          experience: data.experience
            ? JSON.parse(data.experience)
            : {
                years: 0,
                description: "",
              },
        }

        setUserData(parsedData)
        console.log("User data:", parsedData)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Create preview immediately for better UX
        setPreviewUrl(URL.createObjectURL(file))

        // Resize image
        const resizedImage = await resizeImage(
          file,
          MAX_IMAGE_SIZE,
          MAX_IMAGE_SIZE
        )
        setSelectedImage(resizedImage)
      } catch (error) {
        console.error("Error processing image:", error)
        setUpdateError("Failed to process image. Please try a different one.")
      }
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="Widget">
          <div className="Widget-body Text--center">
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="Widget">
          <div className="Widget-body Text--center">
            <Spinner animation="border" />
          </div>
        </div>
      </>
    )
  }

  if (!userData) {
    return (
      <>
        <Navbar />
        <div className="Widget">
          <div className="Widget-body Text--center">
            <p>No profile data found.</p>
          </div>
        </div>
      </>
    )
  }

  const handleEditProfile = async (values: {
    first_name: string
    last_name: string
    phone_number: string
    email: string
    age: number
  }) => {
    try {
      const formData = new FormData()
      formData.append("first_name", values.first_name.trim())
      formData.append("last_name", values.last_name.trim())
      formData.append("phone", values.phone_number.trim())
      formData.append("email", values.email.trim())
      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      const response = await api.put(
        `/volunteer/edit-profile/${user?.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )

      const updated = response.data
      setUserData({
        ...userData!,
        ...updated,
        // preserve fields from volunteers table
        skills: userData!.skills,
        interests: userData!.interests,
        availability: userData!.availability,
        experience: userData!.experience,
      })

      setShowEditModal(false)
      setSelectedImage(null)
      setPreviewUrl("")
    } catch (error) {
      console.error("Edit profile failed:", error)
      setUpdateError("Failed to update profile.")
    }
  }

  return (
    <>
      <Navbar />

      {showEditModal && (
        <Modal
          header="Edit Profile"
          action={() => setShowEditModal(false)}
          large
          body={
            <Formik
              initialValues={{
                first_name: userData?.first_name || "",
                last_name: userData?.last_name || "",
                phone_number: userData?.phone_number || "",
                email: userData?.email || "",
                age: userData?.age || 18,
                image_url: userData?.image_url || "",
              }}
              validationSchema={Yup.object({
                first_name: Yup.string().required("Required"),
                last_name: Yup.string().required("Required"),
                phone_number: Yup.string().required("Required"),
                email: Yup.string().email("Invalid").required("Required"),
                age: Yup.number().min(18).required("Required"),
              })}
              onSubmit={handleEditProfile}
            >
              {({ isSubmitting, errors, touched, setFieldValue }) => (
                <Form>
                  <div className="Form-group">
                    <div className="Profile-image-upload">
                      <img
                        src={
                          previewUrl ||
                          userData?.image_url ||
                          "/default-avatar.png"
                        }
                        alt="Profile"
                        className="Profile-image"
                      />

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="Button Button-color--blue-1000 Width--100"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {userData?.image_url ? "Change Image" : "Upload Image"}
                      </button>
                    </div>
                  </div>

                  {[
                    ["first_name", "First Name"],
                    ["last_name", "Last Name"],
                    ["email", "Email"],
                    ["phone_number", "Phone Number"],
                  ].map(([name, label]) => (
                    <div key={name} className="Form-group">
                      <label htmlFor={name}>{label}</label>
                      <Field
                        name={name as keyof typeof errors}
                        className="Form-input-box"
                        placeholder={`Enter your ${label.toLowerCase()}`}
                      />
                      {errors[name as keyof typeof errors] &&
                        touched[name as keyof typeof touched] && (
                          <div className="Form-error">
                            {errors[name as keyof typeof errors]}
                          </div>
                        )}
                    </div>
                  ))}

                  <div className="Flex-row Margin-top--20">
                    <button
                      type="button"
                      className="Button Button-color--gray-1000 Button--hollow Width--100 Margin-right--4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="Button Button-color--blue-1000 Margin-left--4 Width--100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          }
        />
      )}

      {showSkillsModal && (
        <Modal
          header="Add Skills"
          action={() => setShowSkillsModal(false)}
          body={
            <Formik
              initialValues={{ skills: userData.skills || [] }}
              onSubmit={(values) => {
                setUserData({ ...userData, skills: values.skills })
                setShowSkillsModal(false)
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <div className="Flex-wrap--tags">
                    {SKILLS_OPTIONS.map((skill) => {
                      const isSelected = values.skills.includes(skill)

                      return (
                        <span
                          key={skill}
                          className={`Badge ${
                            isSelected
                              ? "Badge-color--blue-1000"
                              : "Badge--hollow"
                          } Cursor--pointer Margin--4`}
                          onClick={() => {
                            const updated = isSelected
                              ? values.skills.filter((s) => s !== skill)
                              : [...values.skills, skill]
                            setFieldValue("skills", updated)
                          }}
                        >
                          {skill}
                        </span>
                      )
                    })}
                  </div>
                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Margin-top--10"
                  >
                    Save Skills
                  </button>
                </Form>
              )}
            </Formik>
          }
        />
      )}

      {showInterestsModal && (
        <Modal
          header="Add Interests"
          action={() => setShowInterestsModal(false)}
          body={
            <Formik
              initialValues={{ interests: userData.interests || [] }}
              onSubmit={(values) => {
                setUserData({ ...userData, interests: values.interests })
                setShowInterestsModal(false)
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <div className="Flex-wrap--tags">
                    {INTERESTS_OPTIONS.map((interest) => {
                      const isSelected = values.interests.includes(interest)

                      return (
                        <span
                          key={interest}
                          className={`Badge ${
                            isSelected
                              ? "Badge-color--blue-1000"
                              : "Badge--hollow"
                          } Cursor--pointer Margin--4`}
                          onClick={() => {
                            const updated = isSelected
                              ? values.interests.filter((i) => i !== interest)
                              : [...values.interests, interest]
                            setFieldValue("interests", updated)
                          }}
                        >
                          {interest}
                        </span>
                      )
                    })}
                  </div>
                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Margin-top--10"
                  >
                    Save Interests
                  </button>
                </Form>
              )}
            </Formik>
          }
        />
      )}

      {showAvailabilityModal && (
        <Modal
          header="Edit Weekly Availability"
          action={() => setShowAvailabilityModal(false)}
          body={
            <Formik
              initialValues={{
                availability: userData.availability || {},
              }}
              onSubmit={(values) => {
                setUserData({ ...userData, availability: values.availability })
                setShowAvailabilityModal(false)
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => {
                    const key = day.toLowerCase()
                    const slots = values.availability[key] || {
                      mornings: false,
                      afternoons: false,
                      evenings: false,
                    }

                    const updateSlot = (slot: keyof typeof slots) => {
                      const updated = {
                        ...values.availability[key],
                        [slot]: !slots[slot],
                      }
                      setFieldValue("availability", {
                        ...values.availability,
                        [key]: updated,
                      })
                    }

                    return (
                      <div key={day} className="Margin-bottom--10">
                        <strong>{day}</strong>
                        <div className="Flex-wrap--tags Margin-top--6 Justify-content--spaceAround">
                          {["mornings", "afternoons", "evenings"].map(
                            (slot) => {
                              const label =
                                slot[0].toUpperCase() + slot.slice(1)
                              const selected = slots[slot as keyof typeof slots]

                              return (
                                <span
                                  key={slot}
                                  className={`Badge ${
                                    selected
                                      ? "Badge-color--blue-1000"
                                      : "Badge--hollow"
                                  } Cursor--pointer Margin--4`}
                                  onClick={() => updateSlot(slot as any)}
                                >
                                  {label}
                                  {selected && <>&nbsp;×</>}
                                </span>
                              )
                            }
                          )}
                        </div>
                      </div>
                    )
                  })}

                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Margin-top--10 Width--100"
                  >
                    Save Availability
                  </button>
                </Form>
              )}
            </Formik>
          }
        />
      )}

      {showExperienceModal && (
        <Modal
          header="Edit Experience"
          action={() => setShowExperienceModal(false)}
          body={
            <Formik
              initialValues={{
                years: userData.experience?.years ?? 0,
                description: userData.experience?.description ?? "",
              }}
              onSubmit={(values) => {
                setUserData({
                  ...userData,
                  experience: {
                    years: values.years,
                    description: values.description,
                  },
                })
                setShowExperienceModal(false)
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <div className="Form-group">
                    <label htmlFor="years">Years of Experience</label>
                    <Field
                      name="years"
                      type="number"
                      className="Form-input-box"
                      min={0}
                    />
                  </div>

                  <div className="Form-group">
                    <label htmlFor="description">Experience Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={4}
                      className="Form-input-box"
                      placeholder="Describe your experience, background, and relevant work..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Margin-top--10 Width--100"
                  >
                    Save Experience
                  </button>
                </Form>
              )}
            </Formik>
          }
        />
      )}

      <div className="container">
        <div className="row py-4">
          <div className="col-lg-4">
            <div className="Block">
              <div className="Block-header">Volunteer Profile</div>
              <div className="Block-subtitle">Your profile details</div>

              <div className="Block-body">
                <div className="Profile-image">
                  <img
                    src={userData.image_url || "/default-avatar.png"}
                    alt="Profile Avatar"
                    className="Profile-avatar"
                  />
                </div>

                {[
                  {
                    label: "Name",
                    icon: "user",
                    value: `${userData.first_name} ${userData.last_name}`,
                  },
                  {
                    label: "Email",
                    icon: "envelope",
                    value: userData.email,
                  },
                  {
                    label: "Phone",
                    icon: "phone",
                    value: userData.phone_number || "Not provided",
                  },
                  {
                    label: "Age",
                    icon: "calendar",
                    value: userData.age || "Not provided",
                  },
                  {
                    label: "Joined",
                    icon: "clock",
                    value: user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Unknown",
                  },
                ].map(({ label, icon, value }) => (
                  <div key={label} className="Event-modal-line">
                    <Icon
                      glyph={icon}
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>{label}:</strong>
                    <div className="Margin-left--auto">{value}</div>
                  </div>
                ))}

                <button
                  className="Button Button-color--blue-1000 Width--100"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
          {/* Skills & Interests Block */}
          <div className="col-lg-4">
            <div className="Block">
              <div className="Block-header">Skills & Interests</div>
              <div className="Block-subtitle">
                Your listed abilities and passions
              </div>

              <div className="Block-body">
                {/* Skills */}
                <div className="Profile-header ">
                  <div>
                    <Icon
                      glyph="check-circle"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Skills:</strong>
                  </div>
                  <Icon
                    glyph="plus"
                    className="Margin-left--auto Text-colorHover--yellow-1000"
                    onClick={() => setShowSkillsModal(true)}
                  />
                </div>

                {userData.skills?.length ? (
                  <div className="Flex-row">
                    {userData.skills.map((skill) => (
                      <span key={skill} className="Filter-tag">
                        {skill}
                        <span
                          className="Filter-tag-close"
                          onClick={() => console.log("Remove skill:", skill)}
                        >
                          &nbsp;×
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="Text-color--gray-600 Flex Justify-content--center">
                    No skills listed
                  </div>
                )}

                {/* Interests */}
                <div className="Profile-header ">
                  <div>
                    <Icon
                      glyph="check-circle"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Interests:</strong>
                  </div>
                  <Icon
                    glyph="plus"
                    className="Margin-left--auto Text-colorHover--yellow-1000"
                    onClick={() => setShowInterestsModal(true)}
                  />
                </div>
                {userData.interests?.length ? (
                  <div className="Flex-wrap--tags">
                    {userData.interests.map((interest) => (
                      <span key={interest} className="Filter-tag">
                        {interest}
                        <span
                          className="Filter-tag-close"
                          onClick={() =>
                            console.log("Remove interest:", interest)
                          }
                        >
                          &nbsp;×
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="Text-color--gray-600 Flex Justify-content--center">
                    No interests listed
                  </span>
                )}
              </div>
            </div>
            {/* Experience */}
            <div className="Block Margin-top--20">
              <div className="Block-header">Experience</div>
              <div className="Block-subtitle">
                Your background and work history
              </div>

              <div className="Block-body">
                <div className="Event-modal-line">
                  <Icon
                    glyph="briefcase"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Years:</strong>
                  <div className="Margin-left--auto">
                    {userData.experience?.years ?? 0}
                  </div>
                </div>

                <div className="Margin-top--10">
                  <div className="Flex-row Align-items--center">
                    <strong>Description:</strong>
                  </div>

                  <div className="Margin-top--6  Justify-content--center">
                    {userData.experience?.description ? (
                      <p className="Text-fontSize--14 Text-color--gray-900">
                        {userData.experience.description}
                      </p>
                    ) : (
                      <p className="Text-color--gray-600">
                        No description provided
                      </p>
                    )}
                  </div>
                  <div
                    className="Button Button-color--blue-1000 Margin-top--10"
                    onClick={() => setShowExperienceModal(true)}
                  >
                    Edit Experience
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="col-lg-4">
            <div className="Block">
              <div className="Block-header">Availability</div>
              <div className="Block-subtitle">Your weekly schedule</div>

              <div className="Block-body">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const key =
                    day.toLowerCase() as keyof typeof userData.availability
                  const slots = userData.availability?.[key] || {}

                  const tags = Object.entries(slots)
                    .filter(([_, available]) => available)
                    .map(([slot]) => {
                      const label = slot[0].toUpperCase() + slot.slice(1)
                      return (
                        <span
                          key={slot}
                          className="Filter-tag Margin-right--4 Margin-top--4"
                        >
                          {label}
                        </span>
                      )
                    })

                  return (
                    <div key={day} className="Margin-bottom--12">
                      <strong>{day}</strong>
                      <div className="Margin-top--4 Flex-wrap--tags">
                        {tags.length > 0 ? (
                          tags
                        ) : (
                          <span className="Text-color--gray-600">
                            Not available
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div
                className="Button Button-color--blue-1000"
                onClick={() => setShowAvailabilityModal(true)}
              >
                Edit Availability
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
