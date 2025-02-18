import { Request, Response } from 'express'
import sql from '../config/db'

export const getRegistrations = async (req: Request, res: Response) => {
    try {
        const registrations = await sql`
          SELECT * FROM volunteer_event
        `
        res.status(200).json(registrations)
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch events", details: error })
      }
}

export const getUserRegistrations = async (req: Request, res: Response) => {
    try {
        const { v_id } = req.params
        const registrations = await sql`SELECT * FROM volunteer_event WHERE v_id = ${v_id}`
        res.status(200).json(registrations)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch registrations", details: error })
    }
}

export const getEventRegistrations = async (req: Request, res: Response) => {
    try {
        const { event_id } = req.params
        const registrations = await sql`SELECT * FROM volunteer_event WHERE event_id = ${event_id}`
        res.status(200).json(registrations)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch registrations", details: error })
    }
}

export const createRegistration = async (req: Request, res: Response) => {
    try {
        const { v_id, event_id } = req.body
        const newRegistration = await sql`INSERT INTO volunteer_event (v_id, event_id) VALUES (${v_id}, ${event_id})`
        res.status(201).json(newRegistration)
    } catch (error) {
        res.status(500).json({ error: "Failed to create registration", details: error })
    }
}

export const deleteRegistration = async (req: Request, res: Response) => {
    try {
        const { v_id, event_id } = req.params
        const deletedRegistration = await sql`
            DELETE FROM volunteer_event
            WHERE v_id = ${v_id} AND event_id = ${event_id}
            RETURNING *
        `

        if (deletedRegistration.length === 0) {
            return res.status(404).json({ error: "Registration not found" })
        }
        res.status(200).json({ message: "Registration deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Failed to delete registration", details: error })
    }
}