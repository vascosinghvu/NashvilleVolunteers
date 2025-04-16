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
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  // Special organization contact info
  const specialOrgContacts = {
    // Hands On Nashville
    "f42d2a91-76ae-42ed-9f51-b2c5c457385e": {
      email: "handson@unitedwaygn.org",
      phone_number: "(615) 298-1108"
    },
    // The Nashville Food Project
    "be50cc09-e388-4ee1-8e4e-d87a70e5669f": {
      email: "info@thenashvillefoodproject.org",
      phone_number: "615-460-0172"
    }
  };

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        setLoading(true)
        const [orgResponse, eventsResponse] = await Promise.all([
          api.get(`/organization/get-organization/${id}`),
          api.get(`/event/organization/${id}`)
        ])
        
        let orgData = orgResponse.data;
        
        // Apply special contact info if this is one of our special organizations
        if (id && id in specialOrgContacts) {
          orgData = {
            ...orgData,
            ...specialOrgContacts[id as keyof typeof specialOrgContacts]
          };
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
  const isSpecialOrg = id && id in specialOrgContacts;

  return (
    <>
      <Navbar />
      <MetaData title={organization.org_name} description="Organization Details" />
      <div className="Container">
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '500px 1fr',
          gap: '24px',
          padding: '32px',
          backgroundColor: 'white'
        }}>
          {/* Left column - Organization Profile */}
          <div className="Block Widget-block" style={{ 
            height: 'fit-content',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '4px',
              wordBreak: 'break-word'
            }}>{organization.org_name}</h1>
            <h2 style={{
              fontSize: '20px',
              color: '#666',
              marginBottom: '32px',
              wordBreak: 'break-word'
            }}>Organization Details</h2>

            {organization.image_url && (
              <img
                src={organization.image_url}
                alt="Organization Logo"
                style={{ 
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto',
                  marginBottom: '32px',
                  display: 'block'
                }}
              />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '16px'
                }}>Description</h3>
                <p style={{
                  fontSize: '16px',
                  color: '#444',
                  lineHeight: '1.6',
                  wordBreak: 'break-word'
                }}>{organization.description || "No description provided"}</p>
              </div>

              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '16px'
                }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a 
                    href={`mailto:${organization.email}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#0066cc',
                      textDecoration: 'none',
                      fontSize: '16px',
                      wordBreak: 'break-all'
                    }}
                  >
                    <Icon glyph="envelope" className="Icon--no-shrink Margin-right--8" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {organization.email}
                    </span>
                  </a>

                  {organization.phone_number && (
                    <a 
                      href={`tel:${organization.phone_number}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#0066cc',
                        textDecoration: 'none',
                        fontSize: '16px'
                      }}
                    >
                      <Icon glyph="phone" className="Icon--no-shrink Margin-right--8" />
                      <span>{organization.phone_number}</span>
                    </a>
                  )}

                  {organization.website && (
                    <a 
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#0066cc',
                        textDecoration: 'none',
                        fontSize: '16px',
                        wordBreak: 'break-all'
                      }}
                    >
                      <Icon glyph="link" className="Icon--no-shrink Margin-right--8" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Visit Website
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Events */}
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '32px'
            }}>Upcoming Events</h1>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {events.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  No upcoming events from this organization.
                </div>
              ) : (
                events.map((event) => (
                  <Event
                    key={event.event_id}
                    event={event}
                    organizationName={organization.org_name}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrganizationDetails 