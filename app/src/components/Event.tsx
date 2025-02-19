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
  isCreateButton?: boolean
}

const Event: React.FC<EventProps> = ({ event, organizationName, onClick, isCreateButton }) => {
  if (isCreateButton) {
    return (
      <div className="Event cursor-pointer" onClick={onClick}>
        <div className="Event-color border-2 border-dotted border-gray-300 hover:border-blue-500 transition-colors bg-white">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-xl font-medium text-gray-600">Create New Event</span>
            </div>
          </div>
        </div>
        <div className="Event-text">
          <div className="Event-text-title">Create New Event</div>
        </div>
      </div>
    )
  }

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