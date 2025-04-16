import os
import time
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import psycopg2
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from datetime import datetime
import re

load_dotenv()

def login():
    print("Attempting to login...")
    login_url = "https://handson.unitedwaygreaternashville.org/login"
    
    # Load credentials from .env
    email = os.getenv('HON_EMAIL')
    password = os.getenv('HON_PASSWORD')
    
    if not email or not password:
        print("Error: Missing HON_EMAIL or HON_PASSWORD in .env file")
        return None
    
    credentials = {
        'Email': email,
        'Password': password
    }
    
    session = requests.Session()
    response = session.post(login_url, data=credentials)
    
    if response.ok:
        print("Login successful!")
        return session
    else:
        print(f"Login failed with status code: {response.status_code}")
        print("Response:", response.text[:500])
        return None

def fetch_events():
    print("Setting up Chrome driver...")
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode (no GUI)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # Initialize the driver
        driver = webdriver.Chrome(options=chrome_options)
        print("Chrome driver initialized successfully")
        
        # Load the page
        print("Loading page...")
        driver.get("https://handson.unitedwaygreaternashville.org/search")
        
        # Wait for the table to be present
        print("Waiting for events table to load...")
        wait = WebDriverWait(driver, 10)
        table = wait.until(
            EC.presence_of_element_located((By.ID, "datatable-search-opportunities-block"))
        )
        
        # Wait a bit more for the table to be populated
        time.sleep(2)
        
        # Get the page source after JavaScript has run
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Find the events table
        events = []
        table = soup.find('table', {'id': 'datatable-search-opportunities-block'})
        
        if not table:
            print("Could not find events table on page")
            return []
            
        # Find all rows in the table body
        rows = table.find('tbody').find_all('tr') if table.find('tbody') else []
        print(f"Found {len(rows)} rows in the table")
        
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 4:
                # Get the URL from the title's link
                title_link = cols[0].find('a')
                url = title_link['href'] if title_link else None
                
                # If we found a relative URL, make it absolute
                if url and not url.startswith('http'):
                    url = f"https://handson.unitedwaygreaternashville.org{url}"
                
                event = {
                    'title': cols[0].get_text(strip=True),
                    'organization': cols[1].get_text(strip=True),
                    'location': cols[2].get_text(strip=True),
                    'date': cols[3].get_text(strip=True),
                    'url': url,
                    'description': ''
                }
                events.append(event)
        
        print(f"Successfully extracted {len(events)} events")
        return events
        
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return []
        
    finally:
        try:
            driver.quit()
            print("Chrome driver closed successfully")
        except:
            pass

def parse_date(date_string):
    try:
        # Clean up the date string
        # Remove "+ More" and any additional text after the time
        date_string = re.sub(r'\+\s*More.*$', '', date_string)
        
        # Try to parse the date
        try:
            # Try format "M/D/YY H:MM AM/PM"
            date_obj = datetime.strptime(date_string.strip(), '%m/%d/%y%I:%M %p')
        except ValueError:
            try:
                # Try format "M/D/YYYY H:MM AM/PM"
                date_obj = datetime.strptime(date_string.strip(), '%m/%d/%Y%I:%M %p')
            except ValueError:
                # If both fail, return None
                print(f"Could not parse date: {date_string}")
                return None
        
        # Format the date as YYYY-MM-DD
        return date_obj.strftime('%Y-%m-%d')
    except Exception as e:
        print(f"Error parsing date '{date_string}': {str(e)}")
        return None

def insert_events(events):
    # Load environment variables
    load_dotenv('../../.env')
    
    # Use the DATABASE_URI from .env
    DATABASE_URI = os.getenv('DATABASE_URI')
    
    try:
        conn = psycopg2.connect(DATABASE_URI)
        cur = conn.cursor()
        
        for event in events:
            # Parse and format the date
            parsed_date = parse_date(event['date'])
            if not parsed_date:
                print(f"Skipping event '{event['title']}' due to invalid date format")
                continue
                
            # Create search_text by combining relevant fields
            search_text = f"{event['title']} {event['organization']} {event['location']}"
            
            # Insert event into database with ON CONFLICT handling
            cur.execute("""
                INSERT INTO events_populate (
                    o_id, 
                    name, 
                    description, 
                    time, 
                    date, 
                    people_needed, 
                    location,
                    image_url,
                    tags,
                    search_text
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (name, o_id, date) DO UPDATE 
                SET description = EXCLUDED.description,
                    time = EXCLUDED.time,
                    people_needed = EXCLUDED.people_needed,
                    location = EXCLUDED.location,
                    image_url = EXCLUDED.image_url,
                    tags = EXCLUDED.tags,
                    search_text = EXCLUDED.search_text
                RETURNING event_id
            """, (
                # event['organization'],  # Using organization as o_id
                "50c46743-c6ef-40a7-a527-3c37091eca39",
                event['title'],
                event['description'],
                None,         # time
                parsed_date,  # formatted date
                None,         # people_needed
                event['location'],
                None,         # image_url
                None,         # tags
                search_text   # search_text
            ))
            
            event_id = cur.fetchone()[0]
            print(f"Inserted/Updated event ID: {event_id}")
        
        conn.commit()
        print(f"Successfully inserted/updated {len(events)} events")
        
    except Exception as e:
        print(f"Error inserting events: {str(e)}")
        print("Error details:", str(e.__cause__))
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    events = fetch_events()
    if events:
        insert_events(events)