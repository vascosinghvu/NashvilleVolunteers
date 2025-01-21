import React, { type ReactElement, useEffect, useState } from "react"
import { Formik, Form, Field } from "formik"
import { api } from "../api"
import AsyncSubmit from "../components/AsyncSubmit"
import Navbar from "../components/Navbar"
import Spinner from "react-bootstrap/Spinner"
import Modal from "../components/Modal"
import { calcScore } from "../util"

const Game = (): ReactElement => {
  // State variables
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [wordLoading, setWordLoading] = React.useState<boolean>(false)
  const [success, setSuccess] = React.useState<string>("")
  const [word, setWord] = useState<string>("")
  const [hint, setHint] = useState<boolean>(false)
  const [hintString, setHintString] = useState<string>("")
  const [scramble, setscramble] = useState<string>("")
  const [prevWords, setPrevWords] = useState<string[]>([])
  const [mode, setMode] = useState<string>("easy")
  const [guessedWords, setGuessedWords] = useState<string[]>([])
  const [seconds, setSeconds] = useState(30)
  const [showModal, setShowModal] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [score, setScore] = useState(0)

  // useEffects to handle changes in state
  useEffect(() => {
    let interval: any

    if (timerActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds - 1)
      }, 1000)
    }
    if (seconds === 0) {
      // Show the modal when seconds reach 0
      setShowModal(true)
      setHint(false)
      setHintString("")
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [timerActive, seconds])

  useEffect(() => {
    restartGame()
  }, [mode])

  // Functions to handle timer
  const handleStartTimer = () => {
    setTimerActive(true)
  }

  const handleResetTimer = () => {
    setTimerActive(false)
    setSeconds(30) // Reset the timer to its initial value
  }

  const restartGame = () => {
    setHint(false)
    setHintString("")
    setGuessedWords([])
    setPrevWords([]) // Reset the streak
    getWord()
    setSuccess("")
    setScore(0)
  }

  // Pings API to fetch a word based on the mode the user has selected
  const getWord = async () => {
    handleResetTimer()
    try {
      setWordLoading(true)
      const response = await api.get(`/new/${mode}`)
      if (response.status === 200) {
        setWord(response.data.word)
        setGuessedWords([])
        setscramble(response.data.scramble)
        handleStartTimer()
        setSuccess("")
      }
    } catch (error) {
      console.log(error)
    }
    setWordLoading(false)
  }

  // Requests hints from the API which grabs the definition from a 3rd party API
  const getHint = async () => {
    let body = {
      word: word,
    }
    try {
      const response = await api.post(`/hint`, JSON.stringify(body))
      if (response.status === 200) {
        setHint(true)
        setHintString(response.data.hint)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Formik form to submit guesses
  interface FormTypes {
    guessValue: string
  }

  const initialValues = {
    guessValue: "",
  }

  // Handles the submission of guesses
  const handleSubmit = async (values: FormTypes, form: any) => {
    setIsLoading(true)
    if (values.guessValue !== word) {
      setGuessedWords([...guessedWords, values.guessValue])
    }

    const body = {
      word: word,
      guess: values.guessValue,
    }

    // Submit the guess to the API
    try {
      const response = await api.post(`/guess`, JSON.stringify(body))

      if (response.status === 200) {
        setSuccess(response.data.correct)
        if (response.data.correct === "Correct") {
          setScore(calcScore(score, 30 - seconds, hint))
          getWord()
          setHint(false)
          setHintString("")
          setSuccess(response.data.correct)
          setPrevWords([...prevWords, values.guessValue])
        }
        // Reset the form
        form.resetForm()
      }
      // error handling
    } catch (error) {
      console.log(error)
    }

    // allows the spinner to be shown for a bit
    setIsLoading(false)
  }

  return (
    <>
      {showModal && (
        <>
          {/* Modal to show when the timer runs out -- prompts user to play again*/}
          <Modal
            header="Out of Time"
            action={() => {
              setShowModal(false)
            }}
            body={
              <>
                <div className="Margin-top--20 Margin-bottom--40">
                  Your streak was {prevWords.length}{" "}
                  {prevWords.length === 1 ? "word" : "words"}.{" "}
                  <div>
                    The word you missed was{" "}
                    <span className="Text--bold">{word}</span>.
                  </div>
                </div>

                <div
                  className="Button Button-color--orange-1000"
                  onClick={() => {
                    setShowModal(false)
                    restartGame()
                  }}
                >
                  Play again
                </div>
              </>
            }
          />
        </>
      )}
      <Navbar />
      <div className="Game">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="Block">
                {/* Game Header */}
                <div className="Block-header Text-color--pink-1000">
                  Round {prevWords.length + 1}
                </div>
                <div className="Block-subtitle">
                  Guess the word from the scrambled letters
                </div>

                {/* Difficulty Mode Buttons */}
                <div className="Flex-row Margin-top--20">
                  <div
                    className={`Button Button--small ${
                      mode === "easy" ? "" : "Button--hollow"
                    } Button-color--orange-1000 Margin-right--6`}
                    onClick={() => {
                      if (mode !== "easy") {
                        setMode("easy")
                      }
                    }}
                  >
                    Easy
                  </div>
                  <div
                    className={`Button Button--small ${
                      mode === "medium" ? "" : "Button--hollow"
                    } Button-color--orange-1000 Margin-right--6`}
                    onClick={() => {
                      if (mode !== "medium") {
                        setMode("medium")
                      }
                    }}
                  >
                    Medium
                  </div>
                  <div
                    className={`Button Button--small ${
                      mode === "hard" ? "" : "Button--hollow"
                    } Button-color--orange-1000`}
                    onClick={() => {
                      if (mode !== "hard") {
                        setMode("hard")
                      }
                    }}
                  >
                    Hard
                  </div>
                  <div className="Margin-left--auto Margin-top--auto">
                    {seconds} seconds remaining
                  </div>
                </div>

                {/* Scrambled Word or Loading Spinner */}
                <div className="Margin-top--40 Margin-bottom--30 Flex--center">
                  {!wordLoading && seconds !== 0 && (
                    <span className="Text--bold Text-fontSize--40 animate__animated animate__bounceIn">
                      {scramble}
                    </span>
                  )}
                  {wordLoading && (
                    <>
                      <div className="Flex--center Margin-y--20">
                        <Spinner
                          color="primary"
                          style={{ width: 32, height: 32 }}
                        />
                      </div>
                    </>
                  )}
                  {seconds === 0 && !wordLoading && (
                    <>
                      <div
                        className="Button Button-color--pink-1000 animate__animated animate__infinite	infinite animate__pulse"
                        onClick={() => {
                          getWord()
                        }}
                      >
                        Play Again
                      </div>
                    </>
                  )}
                </div>

                {/* Word Guess Form */}
                <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                  {({
                    handleChange,
                    handleBlur,
                    values,
                    errors,
                    touched,
                    isValid,
                    dirty,
                  }) => (
                    <Form>
                      <div className="Flex Align-items--center">
                        <div className="Form-group Flex-grow--1 Margin-right--6">
                          <label htmlFor="nameValue">Word Guess:</label>
                          <Field
                            className="Form-input-box"
                            type="text"
                            id="guessValue"
                            name="guessValue"
                            placeholder="Enter your guess"
                          />
                          {errors.guessValue != null &&
                            Boolean(touched.guessValue) && (
                              <div className="Form-error">
                                {errors.guessValue}
                              </div>
                            )}
                        </div>
                        <div className="Margin-top--16 Margin-left--auto Flex-row">
                          <button
                            className="Button Button--small Button--hollow Button-color--blue-1000 Margin-right--6"
                            onClick={() => {
                              getHint()
                            }}
                            type="button"
                            disabled={hint}
                          >
                            Hint
                          </button>
                          <button
                            className="Button Button--small Button-color--orange-1000 "
                            type="submit"
                            disabled={!isValid || !dirty || isLoading}
                          >
                            {isLoading ? (
                              <AsyncSubmit loading={isLoading} />
                            ) : (
                              "Submit"
                            )}
                          </button>
                        </div>
                      </div>
                      {hintString && (
                        <div className="Text-bold Text-fontSize--12 Margin-bottom--4">
                          Hint: The definition of this word is {hintString}
                        </div>
                      )}
                      {success === "Correct" && (
                        <div className="Form-success">{success}</div>
                      )}
                      {success === "Incorrect" && (
                        <div className="Form-error">{success}</div>
                      )}
                    </Form>
                  )}
                </Formik>

                {/* List of Guessed Words */}
                <div className="Text-bold Margin-top--10">Guessed Words:</div>
                <ul className="Flex-row">
                  {guessedWords.map((word, index) => (
                    <li
                      className="Text-color--dark-700 Text-fontSize--18 Text--bold Margin-right--6"
                      key={index}
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-4">
              {/* Round Score */}
              <div className="Block Flex-grow--1 Margin-bottom--24">
                <div className="Block-header">Round Score</div>
                <div className="Block-subtitle">
                  This is your current score in the game
                </div>
                <div className="Flex-col">
                  <div className="Text-fontSize--50 Text--center">
                    {" "}
                    {score}{" "}
                  </div>
                </div>
              </div>

              {/* Word Streak */}
              <div className="Block Flex-grow--1">
                <div className="Block-header">Word Streak</div>
                <div className="Block-subtitle">
                  Words in your streak will appear here
                </div>
                <div className="Flex-col">
                  {prevWords.map((word, index) => (
                    <div className="Flex-row" key={index}>
                      <div className="Text-color--pink-1000 Text-fontSize--18 Text--bold Margin-right--6">
                        {index + 1}.
                      </div>
                      <div className="Text-color--dark-700 Text-fontSize--18 Text--bold">
                        {word}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Game
