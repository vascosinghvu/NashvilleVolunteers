import { useEffect, useState, useRef } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import Navbar from "../../components/Navbar"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Icon from "../../components/Icon"
import { Spinner } from "react-bootstrap"
import { resizeImage } from "../../utils/imageUtils"

interface OrganizationProfileProps {
  org_name: string
  description: string
  email: string
  phone_number: string
  first_name: string
  last_name: string
  website: string
  image_url: string
  tags: string[]
}

const ProfileSchema = Yup.object().shape({
  org_name: Yup.string().required("Organization name is required"),
  description: Yup.string().required("Description is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  website: Yup.string().url("Invalid URL"),
})

const MAX_IMAGE_SIZE = 400 // Maximum width/height in pixels for better file size

const OrganizationProfile = () => {
  const { user, signOut } = useAuth()
  const [orgData, setOrgData] = useState<OrganizationProfileProps>()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!user) return
      try {
        console.log("Fetching organization profile for:", user.id)
        const response = await api.get(`/organization/get-organization/${user.id}`)
        setOrgData(response.data)
        console.log("Organization data:", response.data)
      } catch (error) {
        console.error("Error fetching organization data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrgData()
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

  const handleSubmit = async (values: OrganizationProfileProps) => {
    try {
      setUpdateError("")
      setUpdateSuccess(false)
      
      const formData = new FormData()
      
      // Add all fields to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })
      
      // Add image if selected
      if (selectedImage) {
        formData.append("image", selectedImage)
      }
      
      const response = await api.put(
        `/organization/update-organization/${user?.id}`,
        formData
      )
      
      if (response.status === 200) {
        setOrgData(response.data)
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
            <p>Please log in to view your organization profile.</p>
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
          <div className="Block-header">Organization Profile</div>
          <div className="Block-subtitle">
            {isEditing ? "Edit your organization's profile" : "Your organization's profile"}
          </div>

          {loading ? (
            <div className="Flex--center">
              <Spinner animation="border" />
            </div>
          ) : orgData ? (
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
                  initialValues={orgData}
                  validationSchema={ProfileSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <div className="Form-group">
                        <label>Organization Logo</label>
                        <div className="Profile-image-upload">
                          <div className="Profile-image-container">
                            <img
                              src={previewUrl || orgData.image_url || "/default-avatar.png"}
                              alt="Organization Logo"
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
                            {orgData.image_url ? "Change Logo" : "Upload Logo"}
                          </button>
                        </div>
                      </div>

                      <div className="Form-group">
                        <label htmlFor="org_name">Organization Name</label>
                        <Field
                          name="org_name"
                          className="Form-input-box"
                          placeholder="Enter organization name"
                        />
                        {errors.org_name && touched.org_name && (
                          <div className="Form-error">{errors.org_name}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="description">Description</label>
                        <Field
                          as="textarea"
                          name="description"
                          className="Form-input-box"
                          placeholder="Describe your organization"
                          rows={4}
                        />
                        {errors.description && touched.description && (
                          <div className="Form-error">{errors.description}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="email">Email</label>
                        <Field
                          name="email"
                          type="email"
                          className="Form-input-box"
                          placeholder="Enter organization email"
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
                          placeholder="Enter organization phone number"
                        />
                        {errors.phone_number && touched.phone_number && (
                          <div className="Form-error">{errors.phone_number}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="website">Website</label>
                        <Field
                          name="website"
                          className="Form-input-box"
                          placeholder="Enter organization website"
                        />
                        {errors.website && touched.website && (
                          <div className="Form-error">{errors.website}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="first_name">Contact Person First Name</label>
                        <Field
                          name="first_name"
                          className="Form-input-box"
                          placeholder="Enter contact person's first name"
                        />
                        {errors.first_name && touched.first_name && (
                          <div className="Form-error">{errors.first_name}</div>
                        )}
                      </div>

                      <div className="Form-group">
                        <label htmlFor="last_name">Contact Person Last Name</label>
                        <Field
                          name="last_name"
                          className="Form-input-box"
                          placeholder="Enter contact person's last name"
                        />
                        {errors.last_name && touched.last_name && (
                          <div className="Form-error">{errors.last_name}</div>
                        )}
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
                          onClick={() => {
                            setIsEditing(false)
                            setSelectedImage(null)
                            setPreviewUrl("")
                          }}
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
                      src={orgData.image_url || "/default-avatar.png"}
                      alt="Organization Logo"
                      className="Profile-avatar"
                    />
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="building"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Organization Name:</strong>
                    <div className="Margin-left--auto">{orgData.org_name}</div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="info-square"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Description:</strong>
                    <div className="Margin-left--auto">{orgData.description}</div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="envelope"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Email:</strong>
                    <div className="Margin-left--auto">{orgData.email}</div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="phone"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Phone:</strong>
                    <div className="Margin-left--auto">
                      {orgData.phone_number || "Not provided"}
                    </div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="globe"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Website:</strong>
                    <div className="Margin-left--auto">
                      {orgData.website || "Not provided"}
                    </div>
                  </div>

                  <div className="Event-modal-line">
                    <Icon
                      glyph="user"
                      className="Margin-right--8 Text-color--royal-1000"
                    />
                    <strong>Contact Person:</strong>
                    <div className="Margin-left--auto">
                      {`${orgData.first_name} ${orgData.last_name}`}
                    </div>
                  </div>

                  <div className="Flex-row Margin-top--20">
                    <button
                      className="Button Button-color--blue-1000"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="Text--center">Failed to load profile data.</div>
          )}
        </div>
      </div>
    </>
  )
}

export default OrganizationProfile
