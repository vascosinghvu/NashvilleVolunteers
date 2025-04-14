// point-scraper.js
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client with explicit schema
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'public'
  }
});

// Point API configuration
const POINT_API_URL = 'https://pointapp-8f268.appspot.com/api/v1/shared/frames/events';
const API_TOKEN = '94ca6772-c69c-4be7-8536-170adf9b838d';

// Nashville Food Project organization ID (you'll need to replace this with your actual UUID)
const NASHVILLE_FOOD_PROJECT_UUID = "be50cc09-e388-4ee1-8e4e-d87a70e5669f";

// Default description for The Nashville Food Project
const DEFAULT_DESCRIPTION = "The Nashville Food Project strives to provide increased access to healthy foods in homeless and underserved communities in the Middle TN area.";

// Function to check current events in Supabase
async function checkExistingEvents() {
  const { data: existingEvents, error: checkError } = await supabase
    .from('events')
    .select('name, o_id, date')
    .eq('o_id', NASHVILLE_FOOD_PROJECT_UUID);

  if (checkError) {
    console.error('Error checking existing events:', checkError);
  } else {
    console.log('Current events in database:', existingEvents?.length || 0);
    console.log('Sample events:', existingEvents?.slice(0, 3));
  }
}

// Function to determine meaningful tags from the event title and data
function extractTags(event) {
  const tags = [];
  
  // Start with "External" tag to ensure it's always first - this will have a green background
  tags.push("External");
  
  // Add primary cause as a tag (likely "Food" for most events)
  if (event.primaryCause && event.primaryCause.title) {
    tags.push(event.primaryCause.title);
  }
  
  // Add "Nashville Food Project" organization tag
  tags.push("Nashville Food Project");
  
  // Extract additional tags from the title
  const title = event.title.toLowerCase();
  
  // Common activity types
  if (title.includes("meal prep") || title.includes("cooking")) {
    tags.push("Meal Prep");
  }
  
  if (title.includes("sorting") || title.includes("preserving")) {
    tags.push("Sorting");
  }
  
  if (title.includes("garden") || title.includes("farm")) {
    tags.push("Garden");
  }
  
  if (title.includes("delivery") || title.includes("distribute")) {
    tags.push("Delivery");
  }
  
  if (title.includes("best use")) {
    tags.push("Best Use");
  }

  // Check if virtual event
  if (event.isVirtual) {
    tags.push("Virtual");
  } else {
    tags.push("In-Person");
  }
  
  return tags;
}

// Function to fetch events from Point API
async function fetchPointEvents(page = 1, size = 12) {
  try {
    console.log(`Fetching events from Point API (page ${page}, size ${size})...`);
    
    const response = await axios.get(POINT_API_URL, {
      params: {
        token: API_TOKEN,
        page,
        size
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching events from Point API (page ${page}):`, error.message);
    throw error;
  }
}

// Function to fetch multiple pages of events
async function fetchMultiplePages(startPage, endPage, size = 12) {
  let allEvents = [];
  let totalAvailable = 0;
  
  for (let page = startPage; page <= endPage; page++) {
    try {
      const data = await fetchPointEvents(page, size);
      
      // Store total events count from first page
      if (page === startPage) {
        totalAvailable = data.total;
      }
      
      // Add this page's events to our collection
      allEvents = [...allEvents, ...data.items];
      
      console.log(`Retrieved ${data.items.length} events from page ${page}`);
      
      // Small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to fetch page ${page}: ${error.message}`);
    }
  }
  
  return {
    items: allEvents,
    total: totalAvailable,
    pagesRetrieved: `${startPage}-${endPage}`,
    eventsRetrieved: allEvents.length
  };
}

// Function to transform Point events to our Supabase format
function cleanEvent(event) {
  console.log('Processing event:', event.title);
  
  // Convert timestamps to ISO strings for readability
  const startDate = new Date(event.startTime);
  
  // Extract and format the date part only (YYYY-MM-DD)
  const formattedDate = startDate.toISOString().split('T')[0];
  
  // Extract and format the time part only (HH:MM:SS)
  const hours = startDate.getHours().toString().padStart(2, '0');
  const minutes = startDate.getMinutes().toString().padStart(2, '0');
  const seconds = startDate.getSeconds().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  
  // Extract meaningful tags using the new function
  const tags = extractTags(event);
  
  // Build link to the event on Point's platform
  const link = `https://dash.pointapp.org/events/${event.id}`;
  
  // Return the cleaned event object
  return {
    // event_id is auto-generated by Supabase, so we don't include it here
    o_id: NASHVILLE_FOOD_PROJECT_UUID,
    date: formattedDate,
    people_needed: event.spots || 0,
    location: event.address || 'Location TBD',
    name: event.title || 'Untitled Event',
    time: formattedTime,
    description: DEFAULT_DESCRIPTION, // Using the specified description
    tags: tags,
    image_url: event.image || '', // Use the image URL from Point if available
    link: link // Using the specified link format
  };
}

// Main function
async function main() {
  try {
    // Fetch events from pages 3-6 as requested
    const startPage = 3;
    const endPage = 6;
    console.log(`Fetching events from pages ${startPage} to ${endPage}...`);
    
    const pointData = await fetchMultiplePages(startPage, endPage);
    
    console.log(`Total events available: ${pointData.total}`);
    console.log(`Events retrieved (pages ${pointData.pagesRetrieved}): ${pointData.eventsRetrieved}`);
    
    // Clean the events
    const cleanedEvents = pointData.items.map(event => cleanEvent(event));
    
    // Remove duplicates based on name, date combination
    const uniqueEvents = cleanedEvents.reduce((acc, event) => {
      const key = `${event.name}-${event.date}`;
      if (!acc[key]) {
        acc[key] = event;
      }
      return acc;
    }, {});
    
    const dedupedEvents = Object.values(uniqueEvents);
    console.log(`Removed ${cleanedEvents.length - dedupedEvents.length} duplicate events`);
    
    // Log sample event data
    if (dedupedEvents.length > 0) {
      console.log('\nSample cleaned event:');
      console.log(JSON.stringify(dedupedEvents[0], null, 2));
    }
    
    // Save to file for verification
    fs.writeFileSync('point-events-for-upsert.json', JSON.stringify(dedupedEvents, null, 2));
    console.log('Events saved to point-events-for-upsert.json for verification');

    // Analyze the tag distribution
    const tagCounts = {};
    dedupedEvents.forEach(event => {
      event.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    console.log('\nTag distribution:');
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        console.log(`- ${tag}: ${count} events`);
      });

    // Check existing events
    await checkExistingEvents();
    
    // Upsert to Supabase
    console.log('\nAttempting to upsert events into the main events table...');
    const { data: insertedData, error } = await supabase
      .from('events')
      .upsert(dedupedEvents, {
        onConflict: 'name,o_id,date',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error upserting events into Supabase:', error);
      if (error.details) {
        console.error('Error details:', error.details);
      }
      if (error.hint) {
        console.error('Error hint:', error.hint);
      }
    } else {
      console.log('Successfully upserted events. Updated/inserted count:', insertedData?.length || 0);
      console.log('First few events:', insertedData?.slice(0, 3));
    }
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main();