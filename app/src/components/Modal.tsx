/*
  This component is a modal that can be used to display information to the user.
*/

import React, { type ReactElement } from "react"
import Icon from "./Icon"

interface ModalProps {
  header?: string
  body?: ReactElement
  large?: boolean
  action?: () => void
}

const Modal = (props: ModalProps): ReactElement => {
  return (
    <>
      <div className="Modal-overlay" onClick={props.action}></div>
      <div
        className={`Modal animate__animated animate__SlideInDown ${
          props.large ?? false ? "Modal-large" : ""
        }`}
      >
        <div onClick={props.action} className="Modal-close">
          <Icon glyph="times" />
        </div>
        {props.header != null && (
          <div className="Modal-header" style={{ marginTop: -10 }}>
            {props.header}
          </div>
        )}
        <div className="Modal-content"> {props.body} </div>
      </div>
    </>
  )
}

export default Modal
