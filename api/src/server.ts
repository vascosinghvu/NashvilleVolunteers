import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"

import * as routes from "./routes/index"

dotenv.config()

console.log(process.env.DATABASE_URI)

var cors = require("cors")

const app = express()
// CORS options
const corsOptions = {
  origin: ["http://localhost:3000", "https://nashville-volunteers.vercel.app"],
  credentials: true,
}

app.use(cors(corsOptions))

app.options("*", cors(corsOptions))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// console.log("Connected to the database...")

app.use("/test", routes.test)
app.use("/event", routes.event)
app.use("/organization", routes.organization)
app.use("/volunteer", routes.volunteer)
app.use("/registration", routes.registration)
app.use("/user", routes.user)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
