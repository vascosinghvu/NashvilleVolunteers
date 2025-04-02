// scraper.js
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with explicit schema
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'public'
  }
});

// Add a function to check current events
async function checkExistingEvents() {
  const { data: existingEvents, error: checkError } = await supabase
    .from('events')
    .select('name, o_id, date')
    .eq('o_id', 'f42d2a91-76ae-42ed-9f51-b2c5c457385e');

  if (checkError) {
    console.error('Error checking existing events:', checkError);
  } else {
    console.log('Current events in database:', existingEvents);
  }
}

// Function to clean a raw event from the API
function cleanEvent(eventData) {
  console.log('Raw event data:', JSON.stringify(eventData, null, 2));
  
  // Parse the StartDateTimeValue and extract date and time
  const startDate = new Date(eventData.StartDateTimeValue);
  const date = startDate.toISOString().split('T')[0]; // e.g., "YYYY-MM-DD"
  const time = startDate.toISOString().split('T')[1].split('.')[0]; // e.g., "HH:MM:SS"
  
  // Use OccurrenceUrl from the API if available; otherwise, fallback to generating a link
  const link = eventData.OccurrenceUrl || `https://handson.unitedwaygreaternashville.org/opportunity/${eventData.SID}`;
  
  // Ensure people_needed is a number
  const peopleNeeded = parseInt(eventData.VolunteersStillNeeded, 10);
  if (isNaN(peopleNeeded)) {
    console.warn(`Invalid people_needed value for event ${eventData.Title}: ${eventData.VolunteersStillNeeded}`);
  }

  // Build the cleaned event object according to your Supabase schema
  const cleaned = {
    o_id: "f42d2a91-76ae-42ed-9f51-b2c5c457385e",
    date: date,
    people_needed: peopleNeeded || 0,
    location: eventData.Location || 'Location TBD',
    name: eventData.Title || 'Untitled Event',
    time: time,
    description: eventData.Description || '',
    tags: ["External", "Hands On"],
    image_url: "https://mpf.com/wp-content/uploads/2014/10/handsOnNashville.jpg",
    link: link
  };

  console.log('Cleaned event:', JSON.stringify(cleaned, null, 2));
  return cleaned;
}

// Define the options for the HTTPS request
const options = {
  hostname: 'handson.unitedwaygreaternashville.org',
  path: '/search/RetrieveFirstLoadForListingInSearch',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
};

console.log('Starting the web scraping...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', async () => {
    try {
      // Parse the top-level JSON response
      const jsonData = JSON.parse(data);
      console.log('Raw API Response Code:', jsonData.code);
      
      // Parse listingOpportunities from the response
      let opportunities = [];
      if (jsonData.listingOpportunities) {
        opportunities = JSON.parse(jsonData.listingOpportunities);
      }
      
      console.log(`Found ${opportunities.length} opportunities.`);
      
      // Filter out events that do not need volunteers and those that are expired
      const now = new Date();
      const filteredOpportunities = opportunities.filter(event => {
        const volunteersNeeded = parseInt(event.VolunteersStillNeeded, 10) || 0;
        const eventDate = new Date(event.StartDateTimeValue);
        return volunteersNeeded > 0 && eventDate >= now;
      });
      
      console.log(`After filtering, ${filteredOpportunities.length} events remain.`);
      
      // Clean the filtered events
      const cleanedEvents = filteredOpportunities.map(event => cleanEvent(event));
      
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
      
      // Log each cleaned event
      console.log('\nFinal cleaned events:');
      dedupedEvents.forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log('Name:', event.name);
        console.log('Date:', event.date);
        console.log('Time:', event.time);
        console.log('People Needed:', event.people_needed);
        console.log('Location:', event.location);
        console.log('Description:', event.description ? event.description.substring(0, 100) + '...' : 'No description');
        console.log('Tags:', event.tags);
        console.log('Link:', event.link);
      });

      // First check existing events
      await checkExistingEvents();

      // Then attempt the upsert
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

        // If we got an error, let's check the schema information
        const { data: schemaInfo, error: schemaError } = await supabase
          .rpc('show_schemas');
        
        if (!schemaError) {
          console.log('Available schemas:', schemaInfo);
        }
      } else {
        console.log('Successfully upserted events. Updated/inserted count:', insertedData?.length || 0);
        console.log('First few events:', insertedData?.slice(0, 3));
      }
      
    } catch (error) {
      console.error('Error processing data:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

// Write the form data for the POST request
req.write("blockId=48815&parameters[sort_by]=Next Date&parameters[searchvo_date_from]=&parameters[searchvo_date_to]=&parameters[age_volunteer_specific]=&parameters[enter_code_invitation_code]=&parameters[share_search_result]=&parameters[save_current_search_as]=&parameters[keyword]=&parameters[location-type]=&parameters[temporal_auxiliar]=&parameters[location]=37210&parameters[distance]=Any&parameters[countRegular]=0&parameters[countTraining]=0&parameters[countFilled]=0&parameters[countEvents]=0&parameters[countOpp55]=0&parameters[language]=en-US");

req.end();