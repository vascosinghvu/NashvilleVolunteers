import { Request, Response } from "express"
import sql from "../config/db"

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await sql`
      SELECT * FROM events
    `
    res.status(200).json(events)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events", details: error })
  }
}

export const getEvent = async (req: Request, res: Response) => {
  try {
    const { event_id } = req.params
    const event = await sql`
      SELECT * FROM events 
      WHERE event_id = ${event_id}
    `
    if (event.length === 0) {
      return res.status(404).json({ error: "Event not found" })
    }
    res.status(200).json(event[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event", details: error })
  }
}

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { o_id, name, description, time, date, people_needed, location } = req.body
    const newEvent = await sql`
      INSERT INTO events (o_id, name, description, time, date, people_needed, location)
      VALUES (${o_id}, ${name}, ${description}, ${time}, ${date}, ${people_needed}, ${location})
      RETURNING *
    `
    res.status(201).json(newEvent[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to create event", details: error })
  }
}

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { event_id } = req.params
    
    // First, get the existing event
    const existingEvent = await sql`
      SELECT * FROM events WHERE event_id = ${event_id}
    `
    
    if (existingEvent.length === 0) {
      return res.status(404).json({ error: "Event not found" })
    }

    // Merge existing data with updates
    const updatedData = { ...existingEvent[0], ...req.body }
    
    // Perform update with all fields
    const updatedEvent = await sql`
      UPDATE events 
      SET 
        o_id = ${updatedData.o_id},
        name = ${updatedData.name},
        description = ${updatedData.description},
        time = ${updatedData.time},
        date = ${updatedData.date},
        people_needed = ${updatedData.people_needed},
        location = ${updatedData.location}
      WHERE event_id = ${event_id}
      RETURNING *
    `
    
    res.status(200).json(updatedEvent[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to update event", details: error })
  }
}

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { event_id } = req.params
    const deletedEvent = await sql`
      DELETE FROM events 
      WHERE event_id = ${event_id}
      RETURNING *
    `
    if (deletedEvent.length === 0) {
      return res.status(404).json({ error: "Event not found" })
    }
    res.status(200).json({ message: "Event deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event", details: error })
  }
}

export default {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
}
