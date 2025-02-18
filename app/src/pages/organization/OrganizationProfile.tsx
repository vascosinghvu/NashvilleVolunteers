import React, { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"

const OrganizationProfile = () => {
  const { user, signOut } = useAuth()
  const [orgData, setOrgData] = useState<any>(null)
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
        <div className="Widget-body">
          <h2 className="Text--bold">Organization Profile</h2>

          {loading ? (
            <p>Loading profile...</p>
          ) : orgData ? (
            <div className="Profile-info">
              <p>
                <strong>Organization Name:</strong> {orgData.org_name}
              </p>
              <p>
                <strong>Description:</strong> {orgData.description}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={orgData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {orgData.website}
                </a>
              </p>
              <p>
                <strong>Phone:</strong> {orgData.phone || "Not provided"}
              </p>
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
