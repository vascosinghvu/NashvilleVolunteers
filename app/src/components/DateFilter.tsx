import React, { useState, useRef, useEffect } from "react"
import Icon from "./Icon"

interface DateFilterProps {
  onDateChange: (dates: { start: string | null; end: string | null }) => void
  selectedDates: {
    start: string | null
    end: string | null
  }
}

const DateFilter: React.FC<DateFilterProps> = ({
  onDateChange,
  selectedDates,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange({
      ...selectedDates,
      end: e.target.value || null,
    })
    setIsOpen(false)
  }

  return (
    <div className="DateFilter">
      <div
        ref={buttonRef}
        className="Button Button-color--royal-1000 DateFilter-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon glyph="calendar" className="DateFilter-icon" />
        Filter by Date
        {(selectedDates.start || selectedDates.end) && " (Active)"}
      </div>

      {isOpen && (
        <div ref={dropdownRef} className="DateFilter-dropdown">
          <div className="DateFilter-item">
            <label>Start Date:</label>
            <input
              type="date"
              value={selectedDates.start || ""}
              onChange={(e) =>
                onDateChange({
                  ...selectedDates,
                  start: e.target.value || null,
                })
              }
              className="DateFilter-input"
            />
          </div>
          <div className="DateFilter-item">
            <label>End Date:</label>
            <input
              type="date"
              value={selectedDates.end || ""}
              onChange={handleEndDateChange}
              className="DateFilter-input"
            />
          </div>
          <button
            className="Button Button-color--blue-1000 DateFilter-clear"
            onClick={() => {
              onDateChange({ start: null, end: null })
              setIsOpen(false)
            }}
          >
            Clear Dates
          </button>
        </div>
      )}
    </div>
  )
}

export default DateFilter
