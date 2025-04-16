import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import { api } from "../../api"
import Icon from "../../components/Icon"
import MetaData from "../../components/MetaData"
import Event from "../../components/Event"

interface VolunteerData {
  v_id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string
  image_url: string
  skills: string[]
  availability: {
    [day: string]: {
      mornings: boolean
      afternoons: boolean
      evenings: boolean
    }
  }
}

interface PastEvent {
  event_id: number
  name: string
  date: string
  organization_name: string
  status: string
}

const VolunteerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null)
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVolunteerDetails = async () => {
      try {
        setLoading(true)
        const [volunteerResponse, eventsResponse] = await Promise.all([
          api.get(`/volunteer/get-volunteer/${id}`),
          api.get(`/registration/get-user-registrations/${id}`)
        ])
        
        const volunteerData = volunteerResponse.data
        // Parse JSONB fields if they exist
        const parsedData = {
          ...volunteerData,
          skills: volunteerData.skills ? JSON.parse(volunteerData.skills) : [],
          availability: volunteerData.availability ? JSON.parse(volunteerData.availability) : {}
        }
        
        setVolunteer(parsedData)
        setPastEvents(eventsResponse.data)
      } catch (error) {
        console.error("Failed to fetch volunteer details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVolunteerDetails()
    }
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="Dashboard">
          <div className="Dashboard-welcome">
            <h1 className="Dashboard-welcome-title">Loading...</h1>
          </div>
        </div>
      </>
    )
  }

  if (!volunteer) {
    return (
      <>
        <Navbar />
        <div className="Dashboard">
          <div className="Dashboard-welcome">
            <h1 className="Dashboard-welcome-title">Volunteer not found</h1>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <MetaData 
        title={`${volunteer.first_name} ${volunteer.last_name} - Volunteer Details`} 
        description="View volunteer information"
      />
      <p>Volunteer Details</p>
      <p>{volunteer.first_name} {volunteer.last_name}</p>
      <p>{volunteer.email}</p>
      <p>{volunteer.phone_number}</p>
      <p>{volunteer.skills.join(", ")}</p>
      <p>{JSON.stringify(volunteer.availability)}</p>
    </>
  )
}

export default VolunteerDetails
