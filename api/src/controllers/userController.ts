import { Request, Response } from "express"
import sql from "../config/db" // Import the database connection

export const getUserByAuthId = async (req: Request, res: Response) => {
  try {
    const { u_id } = req.params

    const user = await sql`
        SELECT * FROM user_profiles WHERE user_id = ${u_id} LIMIT 1;
      `

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }
    console.log("User found:", user[0])
    res.status(200).json(user[0])
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Failed to fetch user", details: error })
  }
}

export default {
  getUserByAuthId,
}
