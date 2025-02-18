import React, { FC } from "react"

interface IconProps {
  glyph: string
  regular?: boolean
  size?: string
  className?: string
}

const Icon: FC<IconProps> = ({
  glyph,
  regular = false,
  size = "",
  className = "",
}) => {
  const iconClass = `fa${regular ? "r" : "s"} fa-${glyph}`

  return (
    <i
      className={`Icon ${iconClass} ${
        size ? `Text-fontSize--${size}` : ""
      } ${className}`}
    />
  )
}

export default Icon
