import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"

import * as routes from "./routes/index"

dotenv.config()

var cors = require("cors")

const app = express()
// CORS options
const corsOptions = {
  origin: "http://localhost:3000", // Allow only your React frontend
  credentials: true, // Allow credentials (cookies, etc.)
}

app.use(cors(corsOptions))

app.options(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

console.log("Connected to the database...")

app.use("/test", routes.test)
app.use("/event", routes.event)
app.use("/organization", routes.organization)
app.use("/volunteer", routes.volunteer)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
