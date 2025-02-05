import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import MetaData from "../components/MetaData"
import { api } from "../api"

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
      
      <div className="Hero" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1628717341663-0007b0ee2597?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '500px',
        width: '100%',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            marginBottom: '20px',
            color: 'white'
          }}>
            Make a Difference in Nashville
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
            Join our community of volunteers and help create positive change
          </p>
          <button 
            className="Landing-hero-button"
            onClick={() => navigate("/listings")}
            style={{
              padding: '15px 30px',
              fontSize: '1.2rem',
              backgroundColor: '#F93943',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              fontWeight: 'bold'
            }}
          >
            Find Opportunities
          </button>
        </div>
      </div>

      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderBottom: '1px solid #eee'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          color: 'var(--nash-color-dark)'
        }}>
          Start Engaging With Your Community Today
        </h2>
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '30px',
          color: 'var(--nash-color-dark)',
          maxWidth: '800px',
          margin: '0 auto 40px'
        }}>
          Whether you're looking to volunteer or organize events, there's a place for you in our community. Join us in making Nashville a better place for everyone.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => navigate("/volunteer-signup")}
            style={{
              padding: '15px 30px',
              fontSize: '1.2rem',
              backgroundColor: '#FFC857', // Yellow
              color: 'var(--nash-color-dark)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Sign Up as a Volunteer
          </button>
          <button 
            onClick={() => navigate("/organizer-signup")}
            style={{
              padding: '15px 30px',
              fontSize: '1.2rem',
              backgroundColor: '#92DCE5', // Blue
              color: 'var(--nash-color-dark)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Sign Up as an Organizer
          </button>
        </div>
      </div>

      <div className="Landing" style={{ padding: '20px' }}>
        <div className="Landing-carousel">
          <h2 className="Landing-carousel-title" style={{ marginTop: '20px' }}>Featured Opportunities</h2>
          <div className="Landing-carousel-scroll">
            <div className="Landing-carousel-track">
              {featuredEvents.map((event, index) => (
                <div 
                  key={`${event.event_id}-${index}`} 
                  className="Landing-carousel-item"
                >
                  <div className="Event">
                    <div className="Event-color">
                      {event.tags?.map((tag) => (
                        <div key={tag} className="Badge Badge-color--light-500">
                          {tag}
                        </div>
                      ))}
                    </div>
                    <div className="Event-text">
                      <div className="Event-text-title">{event.name}</div>
                      <p>{event.description}</p>
                    </div>
                  </div>
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