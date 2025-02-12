import React from "react"

interface EventProps {
  event: {
    event_id: number
    name: string
    description: string
    tags: string[]
    date?: string
    time?: string
    location?: string
    people_needed?: number
    o_id: number
    image_url?: string
  }
  organizationName?: string
  onClick?: () => void
}

const Event: React.FC<EventProps> = ({ event, organizationName, onClick }) => {
  return (
    <div className="Event" onClick={onClick}>
      {event.image_url ? (
        <div className="Event-image">
          <img src={event.image_url} alt={event.name} />
        </div>
      ) : (
        <div className="Event-color">
          {event.tags?.map((tag) => (
            <div key={tag} className="Badge Badge-color--light-500">
              {tag}
            </div>
          ))}
        </div>
      )}
      <div className="Event-text">
        <div className="Event-text-title">{event.name}</div>
        {organizationName && <div className="Event-org">{organizationName}</div>}
        {!organizationName && <p>{event.description}</p>}
      </div>
    </div>
  )
}

export default Event 