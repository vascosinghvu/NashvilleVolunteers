import React, { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Icon from "../../components/Icon"

interface ProfileProps {
  first_name: string
  last_name: string
  phone_number: string
  image_url: string
  age: number
  email: string
}

const Profile = () => {
  const { user, signOut } = useAuth()
  const [userData, setUserData] = useState<ProfileProps>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      try {
        console.log("Fetching user profile for:", user.id)

        const response = await api.get(`/volunteer/get-volunteer/${user.id}`)
        setUserData(response.data)
        console.log("User data:", response.data)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user]) // Fetch data when `user` changes

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
          <div className="Block-subtitle">Update your profile details</div>

          {loading ? (
            <p>Loading profile...</p>
          ) : userData ? (
            <div className="Profile-info">
              {userData.image_url && (
                <div className="Profile-image">
                  <img
                    src={userData.image_url}
                    alt="Profile Avatar"
                    className="Profile-avatar"
                  />
                </div>
              )}

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
                <div className="Margin-left--auto">
                  {user?.email || "No email provided"}
                </div>
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

              <div className="Button Button-color--blue-1000" onClick={signOut}>
                Sign Out
              </div>
            </div>
          ) : (
            <p>No additional user data found.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile
