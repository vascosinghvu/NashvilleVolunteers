import { Request, Response } from "express"
import sql from "../config/db"

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await sql`
      SELECT * FROM organizations
    `
    res.status(200).json(organizations)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch organizations", details: error })
  }
}

export const getOrganization = async (req: Request, res: Response) => {
  try {
    const { o_id } = req.params
    const organization = await sql`
      SELECT * FROM organizations 
      WHERE o_id = ${o_id}
    `
    if (organization.length === 0) {
      return res.status(404).json({ error: "Organization not found" })
    }
    res.status(200).json(organization[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch organization", details: error })
  }
}

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, description, email, website } = req.body
    const newOrganization = await sql`
      INSERT INTO organizations (name, description, email, website)
      VALUES (${name}, ${description}, ${email}, ${website})
      RETURNING *
    `
    res.status(201).json(newOrganization[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to create organization", details: error })
  }
}

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { o_id } = req.params
    
    // First, get the existing organization
    const existingOrganization = await sql`
      SELECT * FROM organizations WHERE o_id = ${o_id}
    `
    
    if (existingOrganization.length === 0) {
      return res.status(404).json({ error: "Organization not found" })
    }

    // Merge existing data with updates
    const updatedData = { ...existingOrganization[0], ...req.body }
    
    // Perform update with all fields
    const updatedOrganization = await sql`
      UPDATE organizations 
      SET 
        name = ${updatedData.name},
        description = ${updatedData.description},
        email = ${updatedData.email},
        website = ${updatedData.website}
      WHERE o_id = ${o_id}
      RETURNING *
    `
    
    res.status(200).json(updatedOrganization[0])
  } catch (error) {
    res.status(500).json({ error: "Failed to update organization", details: error })
  }
}

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { o_id } = req.params
    const deletedOrganization = await sql`
      DELETE FROM organizations 
      WHERE o_id = ${o_id}
      RETURNING *
    `
    if (deletedOrganization.length === 0) {
      return res.status(404).json({ error: "Organization not found" })
    }
    res.status(200).json({ message: "Organization deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete organization", details: error })
  }
}

export default {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
}
