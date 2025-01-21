import React, { type ReactElement } from "react"
import { Spinner } from "react-bootstrap"

const AsyncSubmit = (props: { loading: boolean }): ReactElement => {
  return (
    <>
      {props.loading && (
        <div className="AsyncSubmit">
          <Spinner color="primary" style={{ width: 18, height: 18 }} />
        </div>
      )}
    </>
  )
}

export default AsyncSubmit
