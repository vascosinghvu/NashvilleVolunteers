import { Request, Response } from "express"
import sql from "../config/db"
import { uploadImageToSupabase } from "../utils/uploadImage"
import path from "path"
import supabase from "../config/supabase"

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await sql`
      SELECT * FROM organizations
    `
    res.status(200).json(organizations)
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch organizations", details: error })
  }
}

export const getOrganization = async (req: Request, res: Response) => {
  try {
    const { o_id } = req.params

    const organization = await sql`
      SELECT 
      *
      FROM organizations o
      JOIN user_profiles u ON o.o_id = u.user_id
      WHERE o.o_id = ${o_id}
    `

    if (organization.length === 0) {
      return res.status(404).json({ error: "Organization not found" })
    }

    res.status(200).json(organization[0])
  } catch (error) {
    console.error("Error fetching organization:", error)
    res
      .status(500)
      .json({ error: "Failed to fetch organization", details: error })
  }
}

export const createOrganization = async (req: Request, res: Response) => {
  console.log("Received organization creation request with body:", req.body)

  try {
    const {
      first_name,
      last_name,
      phone,
      org_name,
      description,
      email,
      website,
      auth_id,
      tags,
    } = req.body
    let profile_pic_url = null

    // Handle image upload if a file is provided
    if (req.file) {
      try {
        const fileName = `organization-${auth_id}-${Date.now()}${path.extname(
          req.file.originalname
        )}`
        profile_pic_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          "images"
        )
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
      }
    }

    // Step 1: Insert into `user_profiles`
    await sql`
      INSERT INTO user_profiles (
        user_id, first_name, last_name, phone_number, email, image_url, role
      ) VALUES (
        ${auth_id}, ${first_name}, ${last_name}, ${phone}, ${email}, ${profile_pic_url}, 'organization'
      )
      ON CONFLICT (user_id) DO UPDATE 
      SET role = 'organization'
    `

    // Step 2: Insert into `organizations` (use `org_name` instead of `name`)
    const newOrganization = await sql`
      INSERT INTO organizations (
        o_id, org_name, description, website, tags
      ) VALUES (
        ${auth_id}, ${org_name}, ${description}, ${website}, ${tags || "[]"}
      )
      RETURNING *;
   `

    console.log("Created organization:", newOrganization)
    res.status(201).json(newOrganization[0])
  } catch (error) {
    console.error("Error creating organization:", error)
    res.status(500).json({
      error: "Failed to create organization",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { o_id } = req.params

    // First, get the existing organization data from both tables
    const existingOrganization = await sql`
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.email,
        u.image_url
      FROM organizations o
      JOIN user_profiles u ON o.o_id = u.user_id
      WHERE o.o_id = ${o_id}
    `

    if (existingOrganization.length === 0) {
      return res.status(404).json({ error: "Organization not found" })
    }

    // Handle new image upload if provided
    let image_url = existingOrganization[0].image_url
    if (req.file) {
      try {
        // Upload new image
        const fileName = `org-${o_id}-${Date.now()}${path.extname(
          req.file.originalname
        )}`
        image_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          "images"
        )

        // Delete old image if it exists
        if (existingOrganization[0].image_url) {
          try {
            const url = new URL(existingOrganization[0].image_url)
            const oldFilePath = url.pathname.split("/").pop()

            if (oldFilePath) {
              const { error } = await supabase.storage
                .from("images")
                .remove([oldFilePath])

              if (error) {
                console.error("Failed to delete old image:", error)
              }
            }
          } catch (error) {
            console.error("Error deleting old image from storage:", error)
          }
        }
      } catch (uploadError) {
        console.error("Error uploading new image:", uploadError)
      }
    }

    // Merge existing data with updates
    const updatedData = { ...existingOrganization[0], ...req.body, image_url }

    // Update user_profiles table
    await sql`
      UPDATE user_profiles 
      SET 
        first_name = ${updatedData.first_name},
        last_name = ${updatedData.last_name},
        phone_number = ${updatedData.phone_number},
        email = ${updatedData.email},
        image_url = ${image_url}
      WHERE user_id = ${o_id}
    `

    // Update organizations table
    const updatedOrganization = await sql`
      UPDATE organizations 
      SET 
        org_name = ${updatedData.org_name},
        description = ${updatedData.description},
        website = ${updatedData.website}
      WHERE o_id = ${o_id}
      RETURNING *
    `

    // Fetch and return the complete updated organization data
    const finalOrganization = await sql`
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.email,
        u.image_url
      FROM organizations o
      JOIN user_profiles u ON o.o_id = u.user_id
      WHERE o.o_id = ${o_id}
    `

    res.status(200).json(finalOrganization[0])
  } catch (error) {
    console.error("Error updating organization:", error)
    res
      .status(500)
      .json({ error: "Failed to update organization", details: error })
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
        const url = new URL(organization[0].image_url)
        const filePath = url.pathname.split("/").pop()

        if (filePath) {
          const { error } = await supabase.storage
            .from("images")
            .remove([filePath])

          if (error) {
            console.error("Failed to delete image:", error)
          }
        }
      } catch (error) {
        console.error("Error deleting image from storage:", error)
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
    res
      .status(500)
      .json({ error: "Failed to delete organization", details: error })
  }
}

export default {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
}
