import { Request, Response } from "express"
import sql from "../config/db"  // Import the database connection
import { uploadImageToSupabase } from '../utils/uploadImage';
import path from 'path';
import supabase from '../config/supabase';

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

export const testUpload = async (req: Request, res: Response) => {
  try {
    console.log('⭐ Test upload route hit');
    console.log('⭐ Headers:', req.headers);
    console.log('⭐ File:', req.file);
    console.log('⭐ Body:', req.body);

    if (!req.file) {
      console.log('❌ No file received');
      return res.status(400).json({ 
        error: 'No file uploaded',
        headers: req.headers['content-type'],
        body: req.body 
      });
    }

    // Try to process the file like in createVolunteer
    const fileName = `test-${Date.now()}${path.extname(req.file.originalname)}`;
    const url = await uploadImageToSupabase(
      req.file.buffer,
      fileName,
      'images'
    );

    console.log('✅ File processed successfully:', url);
    
    res.json({ 
      message: 'Test route hit', 
      file: true,
      url: url,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ Error in test upload:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export const createVolunteer = async (req: Request, res: Response) => {
  console.log('Test upload route hit');
  console.log('Headers:', req.headers);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  try {
    console.log('File:', req.file);
    console.log('Received volunteer creation request with body:', req.body);
    
    const { phone, first_name, last_name, email, age, auth_id } = req.body;
    let profile_pic_url = null;

    // Handle image upload if a file was sent
    if (req.file) {
      try {
        const fileName = `volunteer-${auth_id}-${Date.now()}${path.extname(req.file.originalname)}`;
        profile_pic_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          'images'
        );
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue without image if upload fails
      }
    }

    const newVolunteer = await sql`
      INSERT INTO volunteers (
        first_name, 
        last_name, 
        email, 
        phone, 
        age, 
        auth_id,
        profile_pic_url
      )
      VALUES (
        ${first_name}, 
        ${last_name}, 
        ${email}, 
        ${phone}, 
        ${age}, 
        ${auth_id},
        ${profile_pic_url}
      )
      RETURNING *
    `;
    
    console.log('Created volunteer:', newVolunteer);
    
    res.status(201).json(newVolunteer[0]);
  } catch (error) {
    console.error('Error creating volunteer:', error);
    res.status(500).json({ 
      error: "Failed to create volunteer", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

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

    // Handle new image upload if provided
    let profile_pic_url = existingVolunteer[0].profile_pic_url;
    if (req.file) {
      try {
        // Upload new image
        const fileName = `volunteer-${existingVolunteer[0].auth_id}-${Date.now()}${path.extname(req.file.originalname)}`;
        profile_pic_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          'images'
        );

        // Delete old image if it exists
        if (existingVolunteer[0].profile_pic_url) {
          try {
            const url = new URL(existingVolunteer[0].profile_pic_url);
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
            // Continue with update even if old image deletion fails
          }
        }
      } catch (uploadError) {
        console.error('Error uploading new image:', uploadError);
        // Continue with existing image if upload fails
      }
    }

    // Merge existing data with updates
    const updatedData = { 
      ...existingVolunteer[0], 
      ...req.body,
      profile_pic_url 
    }
    
    // Perform update with all fields
    const updatedVolunteer = await sql`
      UPDATE volunteers 
      SET 
        first_name = ${updatedData.first_name},
        last_name = ${updatedData.last_name},
        email = ${updatedData.email},
        phone = ${updatedData.phone},
        age = ${updatedData.age},
        auth_id = ${updatedData.auth_id},
        profile_pic_url = ${profile_pic_url}
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
        const filePath = url.pathname.split('/').pop()
        
        if (filePath) {
          const { error } = await supabase.storage
            .from('images')
            .remove([filePath])
            
          if (error) {
            console.error('Failed to delete image:', error)
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error)
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
