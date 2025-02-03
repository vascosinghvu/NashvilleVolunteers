import { Request, Response } from "express"
import sql from "../config/db"  // Import the database connection

export const getVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await sql`
      SELECT * FROM volunteers
    `
    res.status(200).json(volunteers)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch volunteers", details: error })
  }
}

export const getVolunteer = async (req: Request, res: Response) => {
  try {
    const { v_id } = req.params
    const volunteer = await sql`
      SELECT * FROM volunteers 
      WHERE v_id = ${v_id}
    `
    if (volunteer.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }
    res.status(200).json(volunteer[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch volunteer", details: error })
  }
}

export const getVolunteerByAuthId = async (req: Request, res: Response) => {
  try {
    const { auth_id } = req.params
    const volunteer = await sql`
      SELECT * FROM volunteers 
      WHERE auth_id = ${auth_id}
    `
    if (volunteer.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }
    res.status(200).json(volunteer[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch volunteer", details: error })
  }
}

export const createVolunteer = async (req: Request, res: Response) => {
  try {
    const { phone, first_name, last_name, email, age, auth_id } = req.body
    const newVolunteer = await sql`
      INSERT INTO volunteers (first_name, last_name, email, phone, age, auth_id)
      VALUES (${first_name}, ${last_name}, ${email}, ${phone}, ${age}, ${auth_id})
      RETURNING *
    `
    res.status(201).json(newVolunteer[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to create volunteer", details: error })
  }
}

export const updateVolunteer = async (req: Request, res: Response) => {
  try {
    const { v_id } = req.params
    
    // First, get the existing volunteer
    const existingVolunteer = await sql`
      SELECT * FROM volunteers WHERE v_id = ${v_id}
    `
    
    if (existingVolunteer.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }

    // Merge existing data with updates
    const updatedData = { ...existingVolunteer[0], ...req.body }
    
    // Perform update with all fields
    const updatedVolunteer = await sql`
      UPDATE volunteers 
      SET 
        first_name = ${updatedData.first_name},
        last_name = ${updatedData.last_name},
        email = ${updatedData.email},
        phone = ${updatedData.phone},
        age = ${updatedData.age},
        auth_id = ${updatedData.auth_id}
      WHERE v_id = ${v_id}
      RETURNING *
    `
    
    res.status(200).json(updatedVolunteer[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to update volunteer", details: error })
  }
}

export const deleteVolunteer = async (req: Request, res: Response) => {
  try {
    const { v_id } = req.params
    const deletedVolunteer = await sql`
      DELETE FROM volunteers 
      WHERE v_id = ${v_id}
      RETURNING *
    `
    if (deletedVolunteer.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }
    res.status(200).json({ message: "Volunteer deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete volunteer", details: error })
  }
}

export default {
  getVolunteers,
  getVolunteer,
  getVolunteerByAuthId,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
}
