import React, { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { api } from "../api" // Ensure this is correctly pointing to your backend

const Profile = () => {
  const { user } = useAuth() // Get user from AuthContext
  const [userData, setUserData] = useState<any>(null) // State for user details
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Fetch additional user data from the backend
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/volunteer/get-volunteer/${user.id}`) // Adjust endpoint based on your backend
        setUserData(response.data)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

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
        <div className="Widget-body">
          <h2 className="Text--bold">Profile</h2>

          {loading ? (
            <p>Loading profile...</p>
          ) : userData ? (
            <div className="Profile-info">
              <p>
                <strong>Name:</strong> {userData.first_name}{" "}
                {userData.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Phone:</strong> {userData.phone || "Not provided"}
              </p>
              <p>
                <strong>Age:</strong> {userData.age}
              </p>
              {user?.created_at && (
                <p>
                  <strong>Joined:</strong>{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              )}
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
