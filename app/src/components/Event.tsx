import React from "react"
import Icon from "./Icon"

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
    restricted?: boolean
  }
  organizationName?: string
  onClick?: () => void
  onOrganizationClick?: () => void
  isCreateButton?: boolean
}

const Event: React.FC<EventProps> = ({
  event,
  organizationName,
  onClick,
  onOrganizationClick,
  isCreateButton,
}) => {
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/020/794/577/non_2x/palm-of-hand-and-heart-line-icon-symbol-of-volunteering-linear-pictogram-charity-and-donation-concept-shape-of-heart-and-hand-outline-icon-editable-stroke-isolated-illustration-vector.jpg"

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ]
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    }
  }

  if (isCreateButton) {
    return (
      <div className="Event cursor-pointer" onClick={onClick}>
        <div className="Event-color border-2 border-dotted border-gray-300 hover:border-blue-500 transition-colors bg-white">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-xl font-medium text-gray-600">
                Create New Event
              </span>
            </div>
          </div>
        </div>
        <div className="Event-text">
          <div className="Event-text-title">Create New Event</div>
        </div>
      </div>
    )
  }

  const formattedDate = formatEventDate(event.date)

  // Sort tags to ensure "External" comes first if it exists
  const sortedTags = [...(event.tags || [])].sort((a, b) => {
    if (a === "External") return -1
    if (b === "External") return 1
    return 0
  })

  return (
    <div className="Event" onClick={onClick}>
      <div className="Event-image" style={{ position: "relative" }}>
        <img
          src={event.image_url || defaultImage}
          alt={event.name}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
        {formattedDate && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              background: "#FFFFFF",
              padding: "4px",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              lineHeight: "1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{ fontSize: "10px", fontWeight: "bold", color: "#666666" }}
            >
              {formattedDate.day}
            </div>
            <div
              style={{ fontSize: "16px", fontWeight: "bold", color: "#000000" }}
            >
              {formattedDate.date}
            </div>
            <div
              style={{ fontSize: "10px", fontWeight: "bold", color: "#666666" }}
            >
              {formattedDate.month}
            </div>
          </div>
        )}
        {event.restricted && (
          <div
            className="Event-restricted"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#FFFFFF",
              padding: "4px",
              borderRadius: "4px",
              fontSize: "0.75rem",
              color: "#000000",
            }}
          >
            <Icon glyph="lock" size="16" className="Text-color--royal-1000" />
          </div>
        )}
        <div
          className="Event-tags"
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            right: "8px",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            zIndex: 1,
          }}
        >
          {sortedTags.map((tag) => (
            <div
              key={tag}
              className={`Badge ${
                tag === "External"
                  ? "Badge-color--green-1000"
                  : tag === "Hands On"
                  ? "Badge-color--royal-1000"
                  : "Badge-color--light-1000"
              }`}
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
              e.stopPropagation()
              onOrganizationClick?.()
            }}
            style={{ cursor: "pointer", color: "#0066cc" }}
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
