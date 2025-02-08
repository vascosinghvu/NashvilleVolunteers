import { Request, Response } from "express"
import sql from "../config/db"
import { uploadImageToSupabase } from '../utils/uploadImage'
import path from 'path'
import supabase from '../config/supabase'

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
    let image_url = null;

    // Handle image upload if a file was sent
    if (req.file) {
      try {
        const fileName = `org-${Date.now()}${path.extname(req.file.originalname)}`;
        image_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          'images'
        );
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
      }
    }

    const newOrganization = await sql`
      INSERT INTO organizations (
        name, 
        description, 
        email, 
        website,
        image_url
      )
      VALUES (
        ${name}, 
        ${description}, 
        ${email}, 
        ${website},
        ${image_url}
      )
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

    // Handle new image upload if provided
    let image_url = existingOrganization[0].image_url;
    if (req.file) {
      try {
        // Upload new image
        const fileName = `org-${o_id}-${Date.now()}${path.extname(req.file.originalname)}`;
        image_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          'images'
        );

        // Delete old image if it exists
        if (existingOrganization[0].image_url) {
          try {
            const url = new URL(existingOrganization[0].image_url);
            const oldFilePath = url.pathname.split('/').pop();
            
            if (oldFilePath) {
              const { error } = await supabase.storage
                .from('images')
                .remove([oldFilePath]);
                
              if (error) {
                console.error('Failed to delete old image:', error);
              }
            }
          } catch (error) {
            console.error('Error deleting old image from storage:', error);
          }
        }
      } catch (uploadError) {
        console.error('Error uploading new image:', uploadError);
      }
    }

    // Merge existing data with updates
    const updatedData = { ...existingOrganization[0], ...req.body, image_url }
    
    // Perform update with all fields
    const updatedOrganization = await sql`
      UPDATE organizations 
      SET 
        name = ${updatedData.name},
        description = ${updatedData.description},
        email = ${updatedData.email},
        website = ${updatedData.website},
        image_url = ${image_url}
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

    // First get the organization to get the image URL
    const organization = await sql`
      SELECT image_url FROM organizations 
      WHERE o_id = ${o_id}
    `
    
    if (organization.length === 0) {
      return res.status(404).json({ error: "Organization not found" })
    }

    // If there's an image, delete it from storage
    if (organization[0].image_url) {
      try {
        const url = new URL(organization[0].image_url);
        const filePath = url.pathname.split('/').pop();
        
        if (filePath) {
          const { error } = await supabase.storage
            .from('images')
            .remove([filePath]);
            
          if (error) {
            console.error('Failed to delete image:', error);
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }

    // Then delete the organization
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
