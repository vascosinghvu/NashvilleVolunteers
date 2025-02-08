import { Request, Response } from "express"
import sql from "../config/db"
import supabase from "../config/supabase"
import { uploadImageToSupabase } from '../utils/uploadImage'
import path from 'path'

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
    let image_url = null;

    // Handle image upload if a file was sent
    if (req.file) {
      try {
        const fileName = `event-${Date.now()}${path.extname(req.file.originalname)}`;
        image_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          'images'
        );
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
      }
    }

    const newEvent = await sql`
      INSERT INTO events (
        o_id, 
        name, 
        description, 
        time, 
        date, 
        people_needed, 
        location,
        image_url
      )
      VALUES (
        ${o_id}, 
        ${name}, 
        ${description}, 
        ${time}, 
        ${date}, 
        ${people_needed}, 
        ${location},
        ${image_url}
      )
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

    // Handle new image upload if provided
    let image_url = existingEvent[0].image_url;
    if (req.file) {
      try {
        // Upload new image
        const fileName = `event-${event_id}-${Date.now()}${path.extname(req.file.originalname)}`;
        image_url = await uploadImageToSupabase(
          req.file.buffer,
          fileName,
          'images'
        );

        // Delete old image if it exists
        if (existingEvent[0].image_url) {
          try {
            const url = new URL(existingEvent[0].image_url);
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
    const updatedData = { ...existingEvent[0], ...req.body, image_url }
    
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
        location = ${updatedData.location},
        image_url = ${image_url}
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

    // First get the event to get the image URL
    const event = await sql`
      SELECT image_url FROM events 
      WHERE event_id = ${event_id}
    `
    
    if (event.length === 0) {
      return res.status(404).json({ error: "Event not found" })
    }

    // If there's an image, delete it from storage
    if (event[0].image_url) {
      try {
        const url = new URL(event[0].image_url);
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

    // Then delete the event
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

export const searchEvents = async (req: Request, res: Response) => {
  console.log('Received query:', req.query)  // Debug log
  
  const { query } = req.query
  const { data, error } = await supabase.rpc('search_events', {query});

  if (error) {
      console.error('Error searching events:', error);
      return res.status(500).json({ error: 'Failed to search events' });
  }

  return res.status(200).json(data);  // Send the response back to the client
}

export default {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
}
