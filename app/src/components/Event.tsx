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
  onOrganizationClick?: () => void
  isCreateButton?: boolean
}

const Event: React.FC<EventProps> = ({ event, organizationName, onClick, onOrganizationClick, isCreateButton }) => {
  const defaultImage = "https://static.vecteezy.com/system/resources/previews/020/794/577/non_2x/palm-of-hand-and-heart-line-icon-symbol-of-volunteering-linear-pictogram-charity-and-donation-concept-shape-of-heart-and-hand-outline-icon-editable-stroke-isolated-illustration-vector.jpg"

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
      <div className="Event-image" style={{ position: 'relative' }}>
        <img 
          src={event.image_url || defaultImage} 
          alt={event.name}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        <div className="Event-tags" style={{ 
          position: 'absolute', 
          bottom: '8px', 
          left: '8px', 
          right: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          zIndex: 1
        }}>
          {event.tags?.map((tag) => (
            <div 
              key={tag} 
              className={`Badge ${
                tag === "External" 
                  ? "Badge-color--green-1000" 
                  : tag === "Hands On" 
                    ? "Badge-color--royal-1000"
                    : "Badge-color--light-500"
              }`}
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                background: tag !== "External" && tag !== "Hands On" ? 'rgba(255, 255, 255, 0.9)' : undefined
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
      <div className="Event-text">
        <div className="Event-text-title">{event.name}</div>
        {organizationName && (
          <div 
            className="Event-org" 
            onClick={(e) => {
              e.stopPropagation();
              onOrganizationClick?.();
            }}
            style={{ cursor: 'pointer', color: '#0066cc' }}
          >
            {organizationName}
          </div>
        )}
        {!organizationName && <p>{event.description}</p>}
      </div>
    </div>
  )
}

export default Event 