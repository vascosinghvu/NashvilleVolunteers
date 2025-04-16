import { Request, Response } from "express"
import sql from "../config/db" // Import the database connection
import { uploadImageToSupabase } from "../utils/uploadImage"
import path from "path"
import supabase from "../config/supabase"

export const getVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await sql`
      SELECT * FROM volunteers
    `
    res.status(200).json(volunteers)
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch volunteers", details: error })
  }
}

export const getVolunteer = async (req: Request, res: Response) => {
  try {
    const { v_id } = req.params

    const volunteer = await sql`
      SELECT *
      FROM volunteers v
      JOIN user_profiles u ON v.v_id = u.user_id
      WHERE v.v_id = ${v_id}
    `

    if (volunteer.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }

    res.status(200).json(volunteer[0])
  } catch (error) {
    console.error("Error fetching volunteer:", error)
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

export const testUpload = async (req: Request, res: Response) => {
  try {
    console.log("⭐ Test upload route hit")
    console.log("⭐ Headers:", req.headers)
    console.log("⭐ File:", req.file)
    console.log("⭐ Body:", req.body)

    if (!req.file) {
      console.log("❌ No file received")
      return res.status(400).json({
        error: "No file uploaded",
        headers: req.headers["content-type"],
        body: req.body,
      })
    }

    // Try to process the file like in createVolunteer
    const fileName = `test-${Date.now()}${path.extname(req.file.originalname)}`
    const url = await uploadImageToSupabase(req.file.buffer, fileName, "images")

    console.log("✅ File processed successfully:", url)

    res.json({
      message: "Test route hit",
      file: true,
      url: url,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    })
  } catch (error) {
    console.error("❌ Error in test upload:", error)
    res.status(500).json({
      error: "Upload failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

export const createVolunteer = async (req: Request, res: Response) => {
  console.log("Received volunteer creation request with body:", req.body)

  try {
    const { first_name, last_name, phone, email, age, auth_id } = req.body
    let profile_pic_url = null

    if (req.file) {
      try {
        const fileName = `volunteer-${auth_id}-${Date.now()}${path.extname(
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

    await sql`
      INSERT INTO user_profiles (
        user_id, first_name, last_name, phone_number, email, image_url, role
      ) VALUES (
        ${auth_id}, ${first_name}, ${last_name}, ${phone}, ${email}, ${profile_pic_url}, 'volunteer'
      )
      ON CONFLICT (user_id) DO UPDATE 
      SET role = 'volunteer'
    `

    const newVolunteer = await sql`
      INSERT INTO volunteers (
        v_id, age
      ) VALUES (
        ${auth_id}, ${age}
      )
      RETURNING *;
    `

    console.log("Created volunteer:", newVolunteer)
    res.status(201).json(newVolunteer[0])
  } catch (error) {
    console.error("Error creating volunteer:", error)
    res.status(500).json({
      error: "Failed to create volunteer",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

export const updateVolunteer = async (req: Request, res: Response) => {
  try {
    const { v_id } = req.params
    console.log("⭐ Update request received for volunteer:", v_id)
    console.log("⭐ Request body:", req.body)
    console.log("⭐ Request file:", req.file)
    console.log("⭐ Request headers:", req.headers)

    // Parse the form data
    const {
      first_name,
      last_name,
      phone,
      email,
      age,
      skills,
      interests,
      availability,
      experience,
    } = req.body

    console.log("📝 Parsed form data:", {
      first_name,
      last_name,
      phone,
      email,
      age,
      skills,
      interests,
      availability,
      experience,
    })

    if (!first_name || !last_name || !phone || !email || !age) {
      console.log("❌ Missing required fields:", {
        first_name,
        last_name,
        phone,
        email,
        age,
      })
      return res.status(400).json({ error: "Missing required fields" })
    }

    // First, check if volunteer exists
    const existingVolunteer = await sql`
      SELECT v.*, up.image_url 
      FROM volunteers v
      JOIN user_profiles up ON v.v_id = up.user_id
      WHERE v.v_id = ${v_id}
    `

    if (existingVolunteer.length === 0) {
      console.log("❌ Volunteer not found:", v_id)
      return res.status(404).json({ error: "Volunteer not found" })
    }

    console.log("✅ Found existing volunteer:", existingVolunteer[0])

    // Handle new image upload if provided
    let image_url = existingVolunteer[0].image_url
    if (req.file) {
      try {
        console.log("📸 Processing new image upload")
        const fileName = `volunteer-${v_id}-${Date.now()}${path.extname(
          req.file.originalname
        )}`
        image_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          "images"
        )
        console.log("✅ New image uploaded:", image_url)

        // Delete old image if it exists
        if (existingVolunteer[0].image_url) {
          try {
            const url = new URL(existingVolunteer[0].image_url)
            const oldFilePath = url.pathname.split("/").pop()
            if (oldFilePath) {
              console.log("🗑️ Deleting old image:", oldFilePath)
              const { error } = await supabase.storage
                .from("images")
                .remove([oldFilePath])
              if (error) console.error("❌ Failed to delete old image:", error)
              else console.log("✅ Old image deleted successfully")
            }
          } catch (error) {
            console.error("❌ Error deleting old image from storage:", error)
          }
        }
      } catch (uploadError) {
        console.error("❌ Error uploading new image:", uploadError)
      }
    }

    try {
      // Update user_profiles table
      console.log("📝 Updating user_profiles with data:", {
        first_name,
        last_name,
        phone,
        email,
        image_url,
      })

      await sql`
        UPDATE user_profiles 
        SET 
          first_name = ${first_name},
          last_name = ${last_name},
          phone_number = ${phone},
          email = ${email},
          image_url = ${image_url}
        WHERE user_id = ${v_id}
      `
    } catch (error) {
      console.error("❌ Error updating user_profiles:", error)
      throw error
    }

    try {
      // Update volunteers table with all fields
      console.log("📝 Updating volunteers table with data:", {
        age,
        skills,
        interests,
        availability,
        experience,
      })

      const updatedVolunteer = await sql`
        UPDATE volunteers 
        SET 
          age = ${age},
          skills = ${skills},
          interests = ${interests},
          availability = ${availability},
          experience = ${experience}
        WHERE v_id = ${v_id}
        RETURNING *
      `

      console.log("✅ Updated volunteer data:", updatedVolunteer[0])
    } catch (error) {
      console.error("❌ Error updating volunteers:", error)
      throw error
    }

    // Fetch complete updated profile
    const completeProfile = await sql`
      SELECT v.*, up.first_name, up.last_name, up.phone_number, up.email, up.image_url
      FROM volunteers v
      JOIN user_profiles up ON v.v_id = up.user_id
      WHERE v.v_id = ${v_id}
    `

    console.log("✅ Profile update complete:", completeProfile[0])
    res.status(200).json(completeProfile[0])
  } catch (error) {
    console.error("❌ Error updating volunteer:", error)
    res.status(500).json({
      error: "Failed to update volunteer",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

export const deleteVolunteer = async (req: Request, res: Response) => {
  try {
    const { v_id } = req.params

    // First get the volunteer to get the image URL
    const volunteer = await sql`
      SELECT profile_pic_url FROM volunteers 
      WHERE v_id = ${v_id}
    `

    if (volunteer.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }

    // If there's an image, delete it from storage
    if (volunteer[0].profile_pic_url) {
      try {
        // Extract filename from URL
        const url = new URL(volunteer[0].profile_pic_url)
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
        // Continue with deletion even if image removal fails
      }
    }

    // Then delete the volunteer
    const deletedVolunteer = await sql`
      DELETE FROM volunteers 
      WHERE v_id = ${v_id}
      RETURNING *
    `

    res.status(200).json({ message: "Volunteer deleted successfully" })
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete volunteer", details: error })
  }
}

export const editProfile = async (req: Request, res: Response) => {
  const { v_id } = req.params
  const { first_name, last_name, email, phone } = req.body
  let image_url: string | null = null

  try {
    // Validate required fields
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Get existing user profile
    const result = await sql`
      SELECT image_url FROM user_profiles
      WHERE user_id = ${v_id}
    `

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    image_url = result[0].image_url

    // Upload new image if present
    if (req.file) {
      try {
        const fileName = `profile-${v_id}-${Date.now()}${path.extname(
          req.file.originalname
        )}`
        const newUrl = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          "images"
        )

        // Delete old image if exists
        if (image_url) {
          const oldFilePath = new URL(image_url).pathname.split("/").pop()
          if (oldFilePath) {
            const { error } = await supabase.storage
              .from("images")
              .remove([oldFilePath])
            if (error)
              console.warn("Warning: Could not delete old image:", error)
          }
        }

        image_url = newUrl
      } catch (error) {
        console.error("Image upload failed:", error)
        return res.status(500).json({ error: "Failed to upload image" })
      }
    }

    // Update user profile
    await sql`
      UPDATE user_profiles
      SET
        first_name = ${first_name},
        last_name = ${last_name},
        email = ${email},
        phone_number = ${phone},
        image_url = ${image_url}
      WHERE user_id = ${v_id}
    `

    const updatedUser = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${v_id}
    `

    res.status(200).json(updatedUser[0])
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
}

export const addSkill = async (req: Request, res: Response) => {
  const { v_id } = req.params
  const { skills } = req.body

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: "Skills must be a non-empty array" })
  }

  try {
    const result = await sql`
      UPDATE volunteers
      SET skills = (
        SELECT array_agg(DISTINCT s)
        FROM (
          SELECT unnest(COALESCE(skills, '{}')) AS s
          UNION
          SELECT unnest(${skills}::text[]) AS s
        ) combined
      )
      WHERE v_id = ${v_id}
      RETURNING skills
    `

    res.status(200).json({ skills: result[0].skills })
  } catch (error) {
    console.error("Error adding skills:", error)
    res.status(500).json({ error: "Failed to add skills" })
  }
}

export const addInterest = async (req: Request, res: Response) => {
  const { v_id } = req.params
  const { interests } = req.body

  if (!Array.isArray(interests) || interests.length === 0) {
    return res
      .status(400)
      .json({ error: "Interests must be a non-empty array" })
  }

  try {
    const result = await sql`
      UPDATE volunteers
      SET interests = (
        SELECT array_agg(DISTINCT i)
        FROM (
          SELECT unnest(COALESCE(interests, '{}')) AS i
          UNION
          SELECT unnest(${interests}::text[]) AS i
        ) combined
      )
      WHERE v_id = ${v_id}
      RETURNING interests
    `

    res.status(200).json({ interests: result[0].interests })
  } catch (error) {
    console.error("Error adding interests:", error)
    res.status(500).json({ error: "Failed to add interests" })
  }
}

export const updateSkills = async (req: Request, res: Response) => {
  const { v_id } = req.params
  const { skills } = req.body

  if (!Array.isArray(skills)) {
    return res.status(400).json({ error: "Skills must be an array" })
  }

  try {
    const result = await sql`
      UPDATE volunteers
      SET skills = ${sql.array(skills)}
      WHERE v_id = ${v_id}
      RETURNING skills
    `

    if (result.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }

    res.status(200).json({ skills: result[0].skills })
  } catch (error) {
    console.error("Error updating skills:", error)
    res.status(500).json({ error: "Failed to update skills" })
  }
}

export const updateInterests = async (req: Request, res: Response) => {
  const { v_id } = req.params
  const { interests } = req.body

  if (!Array.isArray(interests)) {
    return res.status(400).json({ error: "Interests must be an array" })
  }

  try {
    const result = await sql`
      UPDATE volunteers
      SET interests = ${sql.array(interests)}
      WHERE v_id = ${v_id}
      RETURNING interests
    `

    if (result.length === 0) {
      return res.status(404).json({ error: "Volunteer not found" })
    }

    res.status(200).json({ interests: result[0].interests })
  } catch (error) {
    console.error("Error updating interests:", error)
    res.status(500).json({ error: "Failed to update interests" })
  }
}

export const updateExperience = async (req: Request, res: Response) => {
  const { v_id } = req.params
  const { years, description } = req.body

  try {
    const experience = {
      years: Number(years) || 0,
      description: description || "",
    }

    const result = await sql`
      UPDATE volunteers
      SET experience = ${JSON.stringify(experience)}::jsonb
      WHERE v_id = ${v_id}
      RETURNING experience
    `
    res.status(200).json({ experience: result[0].experience })
  } catch (error) {
    console.error("Error updating experience:", error)
    res.status(500).json({ error: "Failed to update experience" })
  }
}

export const updateAvailability = async (req: Request, res: Response) => {
  const { v_id } = req.params
  const { availability } = req.body

  if (!availability || typeof availability !== "object") {
    return res.status(400).json({ error: "Availability data required" })
  }

  try {
    const result = await sql`
      UPDATE volunteers
      SET availability = ${JSON.stringify(availability)}::jsonb
      WHERE v_id = ${v_id}
      RETURNING availability
    `
    res.status(200).json({ availability: result[0].availability })
  } catch (error) {
    console.error("Error updating availability:", error)
    res.status(500).json({ error: "Failed to update availability" })
  }
}

export default {
  getVolunteers,
  getVolunteer,
  getVolunteerByAuthId,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  editProfile,
  addSkill,
  updateSkills,
  addInterest,
  updateInterests,
  updateExperience,
  updateAvailability,
}
