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
    weekdays: boolean
    weekends: boolean
    mornings: boolean
    afternoons: boolean
    evenings: boolean
  }
  experience: {
    years: number
    description: string
  }
}

// Validation schema
const ProfileSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  phone_number: Yup.string().required("Phone number is required"),
  age: Yup.number()
    .min(18, "Must be at least 18 years old")
    .required("Age is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  skills: Yup.array().of(Yup.string()),
  interests: Yup.array().of(Yup.string()),
  availability: Yup.object().shape({
    weekdays: Yup.boolean(),
    weekends: Yup.boolean(),
    mornings: Yup.boolean(),
    afternoons: Yup.boolean(),
    evenings: Yup.boolean(),
  }),
  experience: Yup.object().shape({
    years: Yup.number().min(0, "Years must be 0 or greater"),
    description: Yup.string(),
  }),
})

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

  const handleSubmit = async (values: ProfileProps) => {
    try {
      setUpdateError("")
      setUpdateSuccess(false)

      const formData = new FormData()

      // Ensure all required fields are present and convert age to number
      const dataToSend = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone_number.trim(),
        email: values.email.trim(),
        age: Number(values.age),
        skills: JSON.stringify(values.skills || []),
        interests: JSON.stringify(values.interests || []),
        availability: JSON.stringify(
          values.availability || {
            weekdays: false,
            weekends: false,
            mornings: false,
            afternoons: false,
            evenings: false,
          }
        ),
        experience: JSON.stringify(
          values.experience || {
            years: 0,
            description: "",
          }
        ),
      }

      // Validate required fields
      if (
        !dataToSend.first_name ||
        !dataToSend.last_name ||
        !dataToSend.phone ||
        !dataToSend.email ||
        !dataToSend.age
      ) {
        setUpdateError("All fields are required")
        return
      }

      // Add all fields to FormData
      Object.entries(dataToSend).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      // Add image if selected
      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      console.log("Submitting form data:", {
        ...dataToSend,
        hasImage: !!selectedImage,
      })

      const response = await api.put(
        `/volunteer/update-volunteer/${user?.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.status === 200) {
        // Parse the response data
        const responseData = response.data
        const parsedData = {
          ...responseData,
          skills: responseData.skills ? JSON.parse(responseData.skills) : [],
          interests: responseData.interests
            ? JSON.parse(responseData.interests)
            : [],
          availability: responseData.availability
            ? JSON.parse(responseData.availability)
            : {
                weekdays: false,
                weekends: false,
                mornings: false,
                afternoons: false,
                evenings: false,
              },
          experience: responseData.experience
            ? JSON.parse(responseData.experience)
            : {
                years: 0,
                description: "",
              },
        }
        setUserData(parsedData)
        setUpdateSuccess(true)
        setSelectedImage(null)
        setPreviewUrl("")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setUpdateError("Failed to update profile. Please try again.")
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
              onSubmit={async (values) => {
                try {
                  const formData = new FormData()
                  formData.append("first_name", values.first_name.trim())
                  formData.append("last_name", values.last_name.trim())
                  formData.append("phone", values.phone_number.trim())
                  formData.append("email", values.email.trim())
                  formData.append("age", values.age.toString())
                  if (selectedImage) {
                    formData.append("image", selectedImage)
                  }

                  const response = await api.put(
                    `/volunteer/update-volunteer/${user?.id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                  )

                  const updated = response.data
                  setUserData({
                    ...userData!,
                    ...updated,
                    skills: userData!.skills, // keep unchanged
                    interests: userData!.interests,
                    availability: userData!.availability,
                    experience: userData!.experience,
                  })

                  setShowEditModal(false)
                  setSelectedImage(null)
                  setPreviewUrl("")
                } catch (error) {
                  console.error("Profile update failed", error)
                }
              }}
            >
              {({ isSubmitting, errors, touched, setFieldValue }) => (
                <Form>
                  <div className="Form-group">
                    <label>Profile Image</label>
                    <div className="Profile-image-upload">
                      <img
                        src={
                          previewUrl ||
                          userData?.image_url ||
                          "/default-avatar.png"
                        }
                        alt="Profile"
                        className="Profile-image-preview"
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
                        className="Button Button-color--blue-1000"
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
                    ["age", "Age"],
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
                      type="submit"
                      className="Button Button-color--blue-1000 Margin-right--10"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="Button Button-color--gray-1000"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
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

              <div className="Profile-info">
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

              <div className="Profile-info">
                {/* Skills */}
                <div className="Profile-header">
                  <Icon
                    glyph="check-circle"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Skills:</strong>
                </div>
                <div className="Margin-left--20 Margin-top--4">
                  {userData.skills?.length ? (
                    <div className="Flex-wrap--tags">
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
                    <span className="Text-color--gray-600">
                      No skills listed
                    </span>
                  )}
                  <div
                    className="Button Button--small Button-color--blue-1000 Margin-top--8"
                    onClick={() => console.log("Open add skills modal")}
                  >
                    Add Skill
                  </div>
                </div>

                {/* Interests */}
                <div className="Profile-header Margin-top--10">
                  <Icon
                    glyph="heart"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Interests:</strong>
                </div>
                <div className="Margin-left--20 Margin-top--4">
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
                    <span className="Text-color--gray-600">
                      No interests listed
                    </span>
                  )}
                  <div
                    className="Button Button--small Button-color--blue-1000 Margin-top--8"
                    onClick={() => console.log("Open add interests modal")}
                  >
                    Add Interest
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="Block">
              <div className="Block-header">Availability & Experience</div>
              <div className="Block-subtitle">When and how you can help</div>

              <div className="Profile-info">
                {/* Available Days */}
                <div className="Event-modal-line">
                  <Icon
                    glyph="calendar"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Available Days:</strong>
                  <div className="Margin-left--auto">
                    {userData.availability?.weekdays && <span>Weekdays </span>}
                    {userData.availability?.weekends && <span>Weekends </span>}
                    {!userData.availability?.weekdays &&
                      !userData.availability?.weekends && (
                        <span className="Text-color--gray-600">
                          Not specified
                        </span>
                      )}
                  </div>
                </div>

                {/* Available Times */}
                <div className="Event-modal-line">
                  <Icon
                    glyph="clock"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Available Times:</strong>
                  <div className="Margin-left--auto">
                    {userData.availability?.mornings && <span>Mornings </span>}
                    {userData.availability?.afternoons && (
                      <span>Afternoons </span>
                    )}
                    {userData.availability?.evenings && <span>Evenings </span>}
                    {!userData.availability?.mornings &&
                      !userData.availability?.afternoons &&
                      !userData.availability?.evenings && (
                        <span className="Text-color--gray-600">
                          Not specified
                        </span>
                      )}
                  </div>
                </div>

                {/* Volunteer Experience */}
                <div className="Event-modal-line Margin-top--10">
                  <Icon
                    glyph="briefcase"
                    className="Margin-right--8 Text-color--royal-1000"
                  />
                  <strong>Experience:</strong>
                  <div className="Margin-left--auto">
                    <div>
                      <strong>Years:</strong> {userData.experience?.years ?? 0}
                    </div>
                    {userData.experience?.description ? (
                      <div>
                        <strong>Description:</strong>{" "}
                        {userData.experience.description}
                      </div>
                    ) : (
                      <div className="Text-color--gray-600">
                        No description provided
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
