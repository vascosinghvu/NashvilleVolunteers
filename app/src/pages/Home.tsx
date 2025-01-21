import React, { type ReactElement } from "react"
import Icon from "../components/Icon"
import { useNavigate } from "react-router-dom"

const Home = (): ReactElement => {
  // Enter screen to the game
  const navigate = useNavigate()
  return (
    <>
      <div className="Widget">
        <div className="Widget-body animate__animated animate__fadeInDown">
          <div className="Block">
            <div className="Widget-icon Margin-bottom--30">
              <Icon glyph="laugh-squint" />
            </div>
            <div className="Block-header Text--center">
              Welcome to Word Scramble
            </div>
            <div className="Flex-column Flex--center Text-color--dark-700 Text-fontSize--14">
              A fun wordgame for all ages
            </div>
            <div
              className="Button Button-color--orange-1000 Margin-top--20"
              onClick={() => {
                navigate("/game")
              }}
            >
              <div className="Flex Align-items--center">
                <span className="Flex-grow--1">Play Game</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
