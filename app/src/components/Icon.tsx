import React, { FC } from "react"

interface IconProps {
  glyph: string
  regular?: boolean
  size?: string
  className?: string
  onClick?: () => void
}

const Icon: FC<IconProps> = ({
  glyph,
  regular = false,
  size = "",
  className = "",
  onClick = () => {},
}) => {
  const iconClass = `fa${regular ? "r" : "s"} fa-${glyph}`

  return (
    <i
      className={`Icon ${iconClass} ${
        size ? `Text-fontSize--${size}` : ""
      } ${className}`}
      onClick={onClick}
    />
  )
}

export default Icon
