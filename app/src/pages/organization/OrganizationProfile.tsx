import React, { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Icon from "../../components/Icon"

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

const OrganizationProfile = () => {
  const { user, signOut } = useAuth()
  const [orgData, setOrgData] = useState<OrganizationProfileProps>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!user) return
      try {
        console.log("Fetching organization profile for:", user.id)

        const response = await api.get(
          `/organization/get-organization/${user.id}`
        )
        setOrgData(response.data)
        console.log("Organization data:", response.data)
      } catch (error) {
        console.error("Error fetching organization data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrgData()
  }, [user]) // Fetch data when `user` changes

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
          <div className="Block-header">{orgData?.org_name}</div>
          <div className="Block-subtitle">
            Update your Organization's Profile
          </div>

          {loading ? (
            <p>Loading profile...</p>
          ) : orgData ? (
            <div className="Profile-info">
              {orgData.image_url && (
                <div className="Profile-image">
                  <img
                    src={orgData.image_url}
                    alt="Organization Logo"
                    className="Profile-avatar"
                  />
                </div>
              )}

              <div className="Event-modal-line">
                <Icon
                  glyph="info-square"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Description:</strong>
                <div className="Margin-left--auto">
                  {orgData.description || "No description provided"}
                </div>
              </div>

              <div className="Event-modal-line">
                <Icon
                  glyph="envelope"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Email:</strong>
                <div className="Margin-left--auto">
                  {orgData.email || "No email provided"}
                </div>
              </div>

              <div className="Event-modal-line">
                <Icon
                  glyph="phone"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Phone:</strong>
                <div className="Margin-left--auto">
                  {orgData.phone_number || "No phone provided"}
                </div>
              </div>

              <div className="Event-modal-line">
                <Icon
                  glyph="link"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Website:</strong>
                <div className="Margin-left--auto">
                  {orgData.website ? (
                    <a
                      href={orgData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="Link"
                    >
                      Click Here
                    </a>
                  ) : (
                    "No website provided"
                  )}
                </div>
              </div>

              <div className="Event-modal-line">
                <Icon
                  glyph="user"
                  className="Margin-right--8 Text-color--royal-1000"
                />
                <strong>Admin Contact:</strong>
                <div className="Margin-left--auto">
                  {orgData.first_name} {orgData.last_name}
                </div>
              </div>

              <div className="Button Button-color--blue-1000" onClick={signOut}>
                Sign Out
              </div>
            </div>
          ) : (
            <p>No organization data found.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default OrganizationProfile
