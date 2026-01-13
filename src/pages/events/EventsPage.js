import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Bell, PlusCircle, ChevronRight, MapPin, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import '../../styles/Events.css';

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage for RSVP identification
  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/events`);
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRSVP = async (eventId) => {
    if (!storedUser) return alert("Please sign in to join events.");

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/events/${eventId}/rsvp`, {
        userId: storedUser._id
      });
      
      // Update local state to show current attendance and "joined" status
      setEvents(prev => prev.map(ev => 
        ev._id === eventId 
          ? { ...ev, attendeesCount: data.attendeesCount, isJoined: data.isJoined } 
          : ev
      ));
    } catch (err) {
      console.error("RSVP failed", err);
    }
  };

  if (loading) return (
    <div className="market-loader-ui">
      <Loader2 className="spinner" size={40} />
      <p>Locating Local Meets...</p>
    </div>
  );

  return (
    <motion.div className="events-container" initial="initial" animate="animate">
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-badge">
              <Bell size={14} /> <span>Stay Updated on Local Meets</span>
            </div>
            <h1>Local Car Meets & Events</h1>
            <p>Fueling the tribe within <strong>50 miles</strong> of your location.</p>
          </div>
          <button className="btn-create-event" onClick={() => navigate('/create-event')}>
            <PlusCircle size={20} />
            <span>Set Up a Meet</span>
          </button>
        </div>
      </header>
  
      <div className="events-list">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <div className="event-date-badge">
              <span className="month">{event.date.month}</span>
              <span className="day">{event.date.day}</span>
            </div>

            <div className="event-image">
              <img src={event.image} alt={event.title} />
              <div className="image-location-tag">
                <MapPin size={12} />
                <span>{event.location}</span>
              </div>
            </div>
  
            <div className="event-details">
              <span className="event-type-pill">{event.type}</span>
              <h3>{event.title}</h3>
              <div className="event-meta-row">
                <div className="meta-item">
                  <MapPin size={14} className="text-blue" />
                  <span>{event.distance || 'Local'}</span>
                </div>
                <div className="meta-item">
                  <Users size={14} className="text-blue" />
                  <span>{event.attendeesCount} Attending</span>
                </div>
              </div>
            </div>
  
            <div className="event-actions">
              <button 
                className={`btn-primary ${event.isJoined ? 'joined' : ''}`} 
                onClick={() => handleRSVP(event._id)}
              >
                <Calendar size={18} />
                <span>{event.isJoined ? "I'm Going" : "Join Meet"}</span>
              </button>
              <button className="btn-outline" onClick={() => navigate(`/events/${event._id}`)}>
                <span>Get Info</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EventsPage;