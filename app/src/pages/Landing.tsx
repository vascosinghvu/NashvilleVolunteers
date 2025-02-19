import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import MetaData from "../components/MetaData"
import { api } from "../api"
import Event from "../components/Event"

interface Event {
  event_id: number
  o_id: number
  name: string
  description: string
  tags: string[]
}

function Landing() {
  const navigate = useNavigate()
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])

  useEffect(() => {
    const loadInitialEvents = async () => {
      try {
        const response = await api.get("/event/search-events?query=community")
        if (response.data && Array.isArray(response.data)) {
          // Duplicate the events to create seamless loop
          setFeaturedEvents([...response.data, ...response.data])
        }
      } catch (error) {
        console.error("Error loading initial events:", error)
      }
    }

    loadInitialEvents()
  }, [])

  return (
    <>
      <MetaData title="Landing" />
      <Navbar />

      <div className="Hero">
        <div className="Hero__overlay">
          <h1>Make a Difference in Nashville</h1>
          <p>
            Join our community of volunteers and help create positive change
          </p>
          <button
            className="Button Button-color--red-1000"
            onClick={() => navigate("/listings")}
          >
            Find Opportunities
          </button>
        </div>
      </div>

      <div className="Landing-cta">
        <h2>Start Engaging With Your Community Today</h2>
        <p>
          Whether you're looking to volunteer or organize events, there's a
          place for you in our community. Join us in making Nashville a better
          place for everyone.
        </p>
        <div className="Landing-cta-buttons">
          <button
            className="Button Button-color--yellow-1000"
            onClick={() => navigate("/volunteer-signup")}
          >
            Sign Up as a Volunteer
          </button>
          <button
            className="Button Button-color--blue-1000"
            onClick={() => navigate("/organization-signup")}
          >
            Sign Up as an Organizer
          </button>
        </div>
      </div>

      <div className="Landing">
        <div className="Landing-carousel">
          <h2 className="Landing-carousel-title">Featured Opportunities</h2>
          <div className="Landing-carousel-scroll">
            <div className="Landing-carousel-track">
              {featuredEvents.map((event, index) => (
                <div
                  key={`${event.event_id}-${index}`}
                  className="Landing-carousel-item"
                >
                  <Event event={event} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Landing
