import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Ticket, Bell, PlusCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Events.css';

const EventsPage = () => {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      date: { day: '22', month: 'OCT' },
      title: "Morning Shift: Cars & Coffee",
      location: "Mt Vernon, NY",
      distance: "2.4 mi",
      attendees: 145,
      type: "Meetup",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      date: { day: '05', month: 'NOV' },
      title: "Tri-State Euro Track Day",
      location: "Monticello Motor Club",
      distance: "48 mi",
      attendees: 80,
      type: "Track Day",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
    }
  ];

  // --- Animation Variants ---
  const containerVars = {
    animate: { transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div className="events-container" initial="initial" animate="animate" variants={containerVars}>
      <header className="page-header">
        <motion.div variants={itemVars} className="header-content">
          <div className="header-left">
            <div className="header-badge">
              <Bell size={14} /> <span>Stay Updated on Local Meets</span>
            </div>
            <h1>Local Car Meets & Events</h1>
            <p>Fueling the tribe within <strong>50 miles</strong> of your location.</p>
          </div>
          
          {/* UPDATED: Navigates to a community template, not the admin portal */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-create-event"
            onClick={() => navigate('/create-event')} 
          >
            <PlusCircle size={20} />
            <span>Set Up a Meet</span>
          </motion.button>
        </motion.div>
      </header>
  
      <div className="events-list">
        {events.map(event => (
          <motion.div key={event.id} className="event-card" variants={itemVars}>
            {/* ... existing badge and image code ... */}
  
            <div className="event-details">
              <span className="event-type-pill">{event.type}</span>
              <h3>{event.title}</h3>
              {/* ... existing meta code ... */}
            </div>
  
            {/* UPDATED: High-action button stack */}
            <div className="event-actions">
              <button 
                className="btn-action-primary"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <Calendar size={18} />
                <span>I'm Going</span>
              </button>
              <button 
                className="btn-action-ghost"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <span>Get Info</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EventsPage;