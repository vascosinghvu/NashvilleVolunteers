import express, {
  Express,
  Request,
  Response,
  Application,
  response,
} from "express"
import dotenv from "dotenv"
import axios from "axios"
import { scramble } from "./src/util"
const cors = require("cors")

//For env File
dotenv.config()

const app: Application = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 8000

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server")
})

// grabs a random word from the api
app.get("/new/:mode", async (req, res) => {
  try {
    const mode = req.params.mode // Get the difficulty mode from the route parameter

    // Define difficulty ranges -- length of the word that we are grabbing from api
    let minDifficulty, maxDifficulty
    if (mode === "hard") {
      minDifficulty = 8
      maxDifficulty = 9
    } else if (mode === "medium") {
      minDifficulty = 6
      maxDifficulty = 7
    } else {
      minDifficulty = 4
      maxDifficulty = 5
    }

    // randomly generare a number between min and max difficulty
    const randomDifficulty =
      Math.floor(Math.random() * (maxDifficulty - minDifficulty + 1)) +
      minDifficulty

    // IF THE API IS DOWN, USE THIS ONE
    // const url = `https://random-word-api.vercel.app/api?words=1&length=${randomDifficulty}`
    const url = `https://random-word-api.herokuapp.com/word?length=${randomDifficulty}`

    // Wait for the Axios GET request to complete
    const response = await axios.get(url)

    // Extract the word from the response
    const word = response.data[0] // Assuming the API returns an array

    // Return the response with the word
    return res.status(200).json({
      message: `New game created`,
      word: word,
      scramble: scramble(word),
    })
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error("Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

// checks if the guess is correct
app.post("/guess/", async (req, res) => {
  try {
    let word = req.body.word
    let guess = req.body.guess

    // Return the response with the word
    if (word.toLowerCase() === guess.toLowerCase()) {
      return res.status(200).json({ correct: "Correct" })
    } else {
      return res.status(200).json({ correct: "Incorrect" })
    }
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error("Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

// gets the hint of the word
app.post("/hint/", async (req, res) => {
  try {
    const word = req.body.word
    // pings api to get the hint
    const options = {
      method: "GET",
      url: `https://wordsapiv1.p.rapidapi.com/words/${word}/`,
      headers: {
        "X-RapidAPI-Key": "4e7b21d711msh11a38a707fd99fcp1de43fjsnf5ce4533058c",
        "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
      },
    }
    let hint
    try {
      const response = await axios.request(options)
      // Extract the definition of the word from the response
      hint = response.data.results[0].definition
    } catch (error: any) {
      // If there is no definition found, return unavailable
      if (error.response === undefined || error.response.status === 404) {
        return res.status(200).json({ hint: "unavailable" })
      } else {
        console.error(error)
      }
    }

    // Return the response with the hint
    return res.status(200).json({
      hint: hint,
    })
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error("Error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

// lets you know that the backend is running
app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`)
})
