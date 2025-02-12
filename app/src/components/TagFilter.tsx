import React, { useState, useRef, useEffect } from "react"
import Icon from "./Icon"

interface TagFilterProps {
  availableTags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
}

const TagFilter: React.FC<TagFilterProps> = ({
  availableTags,
  selectedTags,
  onTagSelect,
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

  return (
    <div className="TagFilter">
      <div 
        ref={buttonRef}
        className="Button Button-color--yellow-1000 TagFilter-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon glyph="tag" className="TagFilter-icon" />
        Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
      </div>
      
      {isOpen && (
        <div ref={dropdownRef} className="TagFilter-dropdown">
          {availableTags.map((tag) => (
            <label
              key={tag}
              className="TagFilter-item"
            >
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => onTagSelect(tag)}
                className="TagFilter-checkbox"
              />
              {tag}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagFilter 