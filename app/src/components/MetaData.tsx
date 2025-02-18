import React, { type ReactElement } from "react"
import { Helmet } from "react-helmet"

const MetaData = (props: {
  title: string
  description?: string
}): ReactElement => {
  return (
    <div>
      <Helmet>
        <title>{props.title}</title>
        <meta name={props.description} />
      </Helmet>
    </div>
  )
}

export default MetaData
