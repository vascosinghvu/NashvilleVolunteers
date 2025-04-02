import React, { useEffect, useState, useRef } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import Navbar from "../../components/Navbar"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Icon from "../../components/Icon"
import { Spinner } from "react-bootstrap"
import { resizeImage } from "../../utils/imageUtils"

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
  "Other"
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
  "Other"
]

const Profile = () => {
  const { user } = useAuth()
  const [userData, setUserData] = useState<ProfileProps>()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

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
          availability: data.availability ? JSON.parse(data.availability) : {
            weekdays: false,
            weekends: false,
            mornings: false,
            afternoons: false,
            evenings: false
          },
          experience: data.experience ? JSON.parse(data.experience) : {
            years: 0,
            description: ""
          }
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

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Create preview immediately for better UX
        setPreviewUrl(URL.createObjectURL(file))
        
        // Resize image
        const resizedImage = await resizeImage(file, MAX_IMAGE_SIZE, MAX_IMAGE_SIZE)
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
        availability: JSON.stringify(values.availability || {
          weekdays: false,
          weekends: false,
          mornings: false,
          afternoons: false,
          evenings: false
        }),
        experience: JSON.stringify(values.experience || {
          years: 0,
          description: ""
        })
      }
      
      // Validate required fields
      if (!dataToSend.first_name || !dataToSend.last_name || !dataToSend.phone || !dataToSend.email || !dataToSend.age) {
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
        hasImage: !!selectedImage
      })
      
      const response = await api.put(
        `/volunteer/update-volunteer/${user?.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      if (response.status === 200) {
        // Parse the response data
        const responseData = response.data
        const parsedData = {
          ...responseData,
          skills: responseData.skills ? JSON.parse(responseData.skills) : [],
          interests: responseData.interests ? JSON.parse(responseData.interests) : [],
          availability: responseData.availability ? JSON.parse(responseData.availability) : {
            weekdays: false,
            weekends: false,
            mornings: false,
            afternoons: false,
            evenings: false
          },
          experience: responseData.experience ? JSON.parse(responseData.experience) : {
            years: 0,
            description: ""
          }
        }
        setUserData(parsedData)
        setUpdateSuccess(true)
        setIsEditing(false)
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

  return (
    <>
      <Navbar />
      <div className="Widget">
        <div className="Block Widget-block">
          <div className="Block-header">Volunteer Profile</div>
          <div className="Block-subtitle">
            {isEditing ? "Edit your profile details" : "Your profile details"}
          </div>

          {loading ? (
            <div className="Flex--center">
              <Spinner animation="border" />
            </div>
          ) : userData ? (
            <>
              {updateSuccess && (
                <div className="Alert Alert--success Margin-bottom--20">
                  Profile updated successfully!
                </div>
              )}
              {updateError && (
                <div className="Alert Alert--error Margin-bottom--20">
                  {updateError}
                </div>
              )}

              {isEditing ? (
                <Formik
                  initialValues={{
                    first_name: userData?.first_name || "",
                    last_name: userData?.last_name || "",
                    phone_number: userData?.phone_number || "",
                    email: userData?.email || "",
                    age: userData?.age || 18,
                    image_url: userData?.image_url || "",
                    skills: Array.isArray(userData?.skills) ? userData.skills : [],
                    interests: Array.isArray(userData?.interests) ? userData.interests : [],
                    availability: userData?.availability || {
                      weekdays: false,
                      weekends: false,
                      mornings: false,
                      afternoons: false,
                      evenings: false,
                    },
                    experience: userData?.experience || {
                      years: 0,
                      description: "",
                    },
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                    <Form>
                      <div className="Form-group">
                        <label>Profile Image</label>
                        <div className="Profile-image-upload">
                          <div className="Profile-image-container">
                            <img
                              src={previewUrl || userData.image_url || "/default-avatar.png"}
                              alt="Profile Preview"
                              className="Profile-image-preview"
                            />
                          </div>
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
                            {userData.image_url ? "Change Image" : "Upload Image"}
                          </button>
                        </div>
                      </div>

                      <div className="Form-group">
                        <label htmlFor="first_name">First Name</label>
                        <Field
                          name="first_name"
                          className="Form-input-box"
                          placeholder="Enter your first name"
                        />
                        {errors.first_name && touched.first_name && (
                          <div className="Form-error">{errors.first_name}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <Field
                          name="last_name"
                          className="Form-input-box"
                          placeholder="Enter your last name"
                        />
                        {errors.last_name && touched.last_name && (
                          <div className="Form-error">{errors.last_name}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="email">Email</label>
                        <Field
                          name="email"
                          type="email"
                          className="Form-input-box"
                          placeholder="Enter your email"
                        />
                        {errors.email && touched.email && (
                          <div className="Form-error">{errors.email}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <Field
                          name="phone_number"
                          className="Form-input-box"
                          placeholder="Enter your phone number"
                        />
                        {errors.phone_number && touched.phone_number && (
                          <div className="Form-error">{errors.phone_number}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="age">Age</label>
                        <Field
                          name="age"
                          type="number"
                          className="Form-input-box"
                          placeholder="Enter your age"
                        />
                        {errors.age && touched.age && (
                          <div className="Form-error">{errors.age}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label>Skills</label>
                        <div className="Skills-container">
                          {SKILLS_OPTIONS.map((skill) => (
                            <label key={skill} className="Checkbox-label">
                              <Field
                                type="checkbox"
                                name="skills"
                                value={skill}
                                className="Checkbox-input"
                              />
                              <span className="Checkbox-text">{skill}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="Form-group">
                        <label>Interests</label>
                        <div className="Interests-container">
                          {INTERESTS_OPTIONS.map((interest) => (
                            <label key={interest} className="Checkbox-label">
                              <Field
                                type="checkbox"
                                name="interests"
                                value={interest}
                                className="Checkbox-input"
                              />
                              <span className="Checkbox-text">{interest}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="Form-group">
                        <label>Availability</label>
                        <div className="Availability-container">
                          <div className="Availability-section">
                            <h4>Days</h4>
                            <label className="Checkbox-label">
                              <Field type="checkbox" name="availability.weekdays" />
                              <span className="Checkbox-text">Weekdays</span>
                            </label>
                            <label className="Checkbox-label">
                              <Field type="checkbox" name="availability.weekends" />
                              <span className="Checkbox-text">Weekends</span>
                            </label>
                          </div>
                          <div className="Availability-section">
                            <h4>Times</h4>
                            <label className="Checkbox-label">
                              <Field type="checkbox" name="availability.mornings" />
                              <span className="Checkbox-text">Mornings</span>
                            </label>
                            <label className="Checkbox-label">
                              <Field type="checkbox" name="availability.afternoons" />
                              <span className="Checkbox-text">Afternoons</span>
                            </label>
                            <label className="Checkbox-label">
                              <Field type="checkbox" name="availability.evenings" />
                              <span className="Checkbox-text">Evenings</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="Form-group">
                        <label>Volunteer Experience</label>
                        <div className="Experience-container">
                          <div className="Form-group">
                            <label htmlFor="experience.years">Years of Experience</label>
                            <Field
                              name="experience.years"
                              type="number"
                              min="0"
                              className="Form-input-box"
                            />
                          </div>
                          <div className="Form-group">
                            <label htmlFor="experience.description">Experience Description</label>
                            <Field
                              name="experience.description"
                              as="textarea"
                              className="Form-textarea"
                              placeholder="Describe your previous volunteer experience..."
                            />
                          </div>
                        </div>
                      </div>

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
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <div className="Profile-info">
                  <div className="Profile-image">
                    <img
                      src={userData.image_url || "/default-avatar.png"}
                      alt="Profile Avatar"
                      className="Profile-avatar"
                    />
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="user"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Name:</strong>
                    <div className="Margin-left--auto">
                      {userData.first_name} {userData.last_name}
                    </div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="envelope"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Email:</strong>
                    <div className="Margin-left--auto">{userData.email}</div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="phone"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Phone:</strong>
                    <div className="Margin-left--auto">
                      {userData.phone_number || "Not provided"}
                    </div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="calendar"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Age:</strong>
                    <div className="Margin-left--auto">
                      {userData.age || "Not provided"}
                    </div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="clock"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Joined:</strong>
                    <div className="Margin-left--auto">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>

                  <div className="Profile-section">
                    <h3>Skills & Expertise</h3>
                    <div className="Skills-tags">
                      {Array.isArray(userData.skills) && userData.skills.length > 0 ? (
                        userData.skills.map((skill) => (
                          <span key={skill} className="Tag">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="Text-color--gray-600">No skills listed</span>
                      )}
                    </div>
                  </div>

                  <div className="Profile-section">
                    <h3>Interests & Causes</h3>
                    <div className="Interests-tags">
                      {Array.isArray(userData.interests) && userData.interests.length > 0 ? (
                        userData.interests.map((interest) => (
                          <span key={interest} className="Tag">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="Text-color--gray-600">No interests listed</span>
                      )}
                    </div>
                  </div>

                  <div className="Profile-section">
                    <h3>Availability</h3>
                    <div className="Availability-display">
                      <div className="Availability-days">
                        <strong>Days:</strong>
                        {userData.availability?.weekdays && <span>Weekdays</span>}
                        {userData.availability?.weekends && <span>Weekends</span>}
                      </div>
                      <div className="Availability-times">
                        <strong>Times:</strong>
                        {userData.availability?.mornings && <span>Mornings</span>}
                        {userData.availability?.afternoons && <span>Afternoons</span>}
                        {userData.availability?.evenings && <span>Evenings</span>}
                      </div>
                    </div>
                  </div>

                  <div className="Profile-section">
                    <h3>Volunteer Experience</h3>
                    <div className="Experience-display">
                      <p>
                        <strong>Years of Experience:</strong> {userData.experience?.years || 0}
                      </p>
                      {userData.experience?.description && (
                        <p>
                          <strong>Description:</strong> {userData.experience.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    className="Button Button-color--blue-1000 Margin-top--20"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="Flex--center">No profile data found.</div>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile
