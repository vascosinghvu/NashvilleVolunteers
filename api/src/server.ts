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

// Add these middleware before your routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// console.log("Connected to the database...")

app.use("/test", routes.test)
app.use("/event", routes.event)
app.use("/organization", routes.organization)
app.use("/volunteer", routes.volunteer)
app.use("/registration", routes.registration)
app.use("/user", routes.user)

// Add error handling middleware after your routes
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
