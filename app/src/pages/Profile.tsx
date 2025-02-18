import React, { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"

const Profile = () => {
  const { user, signOut } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      try {
        console.log("Fetching user profile for:", user.id)

        const response = await api.get(`/user/get-user/${user.id}`)
        setUserData(response.data)
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
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
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
