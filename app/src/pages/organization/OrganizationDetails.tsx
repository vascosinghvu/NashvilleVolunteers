import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import { api } from "../../api"
import Icon from "../../components/Icon"
import Event from "../../components/Event"
import MetaData from "../../components/MetaData"

interface OrganizationData {
  org_id: number
  org_name: string
  description: string
  email: string
  phone_number: string
  website: string
  image_url?: string
}

interface EventData {
  event_id: number
  o_id: number
  date: string
  people_needed: number
  location: string
  name: string
  time: string
  description: string
  tags: string[]
  image_url?: string
}

const OrganizationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [organization, setOrganization] = useState<OrganizationData | null>(
    null
  )
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  // Special organization contact info
  const specialOrgContacts = {
    // Hands On Nashville
    "f42d2a91-76ae-42ed-9f51-b2c5c457385e": {
      email: "handson@unitedwaygn.org",
      phone_number: "(615) 298-1108",
    },
    // The Nashville Food Project
    "be50cc09-e388-4ee1-8e4e-d87a70e5669f": {
      email: "info@thenashvillefoodproject.org",
      phone_number: "615-460-0172",
    },
  }

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        setLoading(true)
        const [orgResponse, eventsResponse] = await Promise.all([
          api.get(`/organization/get-organization/${id}`),
          api.get(`/event/organization/${id}`),
        ])

        let orgData = orgResponse.data

        // Apply special contact info if this is one of our special organizations
        if (id && id in specialOrgContacts) {
          orgData = {
            ...orgData,
            ...specialOrgContacts[id as keyof typeof specialOrgContacts],
          }
        }

        setOrganization(orgData)
        setEvents(eventsResponse.data)
      } catch (error) {
        console.error("Failed to fetch organization details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrganizationDetails()
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

  if (!organization) {
    return (
      <>
        <Navbar />
        <div className="Dashboard">
          <div className="Dashboard-welcome">
            <h1 className="Dashboard-welcome-title">Organization not found</h1>
          </div>
        </div>
      </>
    )
  }

  // Determine if this is a special org for displaying custom contact info
  const isSpecialOrg = id && id in specialOrgContacts

  return (
    <>
      <MetaData
        title={organization.org_name}
        description="Organization Details"
      />
      <>
        <Navbar />
        <MetaData
          title={organization.org_name}
          description="Organization Details"
        />
        <div className="container">
          <div className="row py-4">
            {/* Left Column - Org Profile */}
            <div className="col-lg-4">
              <div className="Block">
                <div className="Block-header">{organization.org_name}</div>
                <div className="Block-subtitle">Organization Details</div>

                <div className="Block-body">
                  {organization.image_url && (
                    <div className="Margin-bottom--20 Flex--center">
                      <img
                        src={organization.image_url}
                        alt="Organization Logo"
                        className="Profile-avatar"
                      />
                    </div>
                  )}

                  <div className="Margin-bottom--24">
                    <h3 className="Text-fontSize--18 Text-weight--600">
                      Description
                    </h3>
                    <p className="Text-fontSize--14 Margin-top--8">
                      {organization.description || "No description provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="Text-fontSize--18 Text-weight--600">
                      Contact Information
                    </h3>
                    <div className="Margin-top--8 Flex-column Gap--8">
                      <div className="Event-modal-line">
                        <Icon
                          glyph="envelope"
                          className="Margin-right--8 Text-color--royal-1000"
                        />
                        <strong>Email:</strong>
                        <div className="Margin-left--auto">
                          {organization.email}
                        </div>
                      </div>

                      {organization.phone_number && (
                        <div className="Event-modal-line">
                          <Icon
                            glyph="phone"
                            className="Margin-right--8 Text-color--royal-1000"
                          />
                          <strong>Phone:</strong>
                          <div className="Margin-left--auto">
                            {organization.phone_number}
                          </div>
                        </div>
                      )}

                      {organization.website && (
                        <div className="Event-modal-line">
                          <Icon
                            glyph="link"
                            className="Margin-right--8 Text-color--royal-1000"
                          />
                          <strong>Website:</strong>
                          <div className="Margin-left--auto">
                            <a
                              href={organization.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="Text-color--blue-1000 Text-decoration--none"
                            >
                              Visit Website
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Events */}
            <div className="col-lg-8">
              <div className="Block">
                <div className="Block-header">Upcoming Events</div>
                <div className="Block-subtitle">
                  What this organization has planned
                </div>

                <div className="Block-body">
                  {events.length === 0 ? (
                    <div className="Text-color--gray-600 Text-align--center">
                      No upcoming events from this organization.
                    </div>
                  ) : (
                    <div className="row g-3">
                      {events.map((event) => (
                        <div key={event.event_id} className="col-sm-6">
                          <Event
                            event={event}
                            organizationName={organization.org_name}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  )
}

export default OrganizationDetails
