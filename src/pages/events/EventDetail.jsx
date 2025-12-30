import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Share2, Check, Calendar, ChevronLeft, Trophy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Events.css';

const EventDetail = () => {
  const navigate = useNavigate();
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock data - In a real app, you'd fetch this via ID from params
  const event = {
    title: "Morning Touge & Coffee",
    organizer: "JDM_Tribe_NYC",
    location: "Bear Mountain State Park, NY",
    time: "8:00 AM - 12:00 PM",
    date: "Sunday, Oct 15th",
    driveRoute: "https://www.google.com/maps/dir/...",
    attendees: 42,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    description: "Meeting at the lower lot for coffee and then heading through the Seven Lakes Drive route. All makes welcome, but heavy JDM presence expected.",
    activities: [
      { time: "08:00", task: "Meetup & Espresso" },
      { time: "09:30", task: "Drivers Briefing" },
      { time: "10:00", task: "Departure to Summit" }
    ]
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="event-detail-container"
    >
      {/* NAVIGATION & HERO */}
      <header className="detail-header">
        <button className="back-btn-glossy" onClick={() => navigate('/events')}>
          <ChevronLeft size={18} /> Back to Meets
        </button>
        
        <div className="event-hero-banner">
          <img src={event.image} alt="Event Hero" className="hero-img" />
          <div className="hero-overlay-dark"></div>
          <div className="hero-content-text">
            <motion.span 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="event-pill-accent"
            >
              Confirmed Meet
            </motion.span>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {event.title}
            </motion.h1>
            <div className="organizer-chip">
              <div className="chip-avatar"></div>
              <span>Host: <strong>{event.organizer}</strong></span>
            </div>
          </div>
        </div>
      </header>

      <div className="event-grid-layout">
        {/* MAIN COLUMN */}
        <div className="event-main-column">
          
          <section className="detail-card-section">
            <div className="section-title">
              <Trophy size={20} className="text-blue" />
              <h2>Overview</h2>
            </div>
            <p className="description-text">{event.description}</p>
          </section>

          <section className="detail-card-section">
            <div className="section-title">
              <Clock size={20} className="text-blue" />
              <h2>Run Sheet</h2>
            </div>
            <div className="modern-timeline">
              {event.activities.map((act, index) => (
                <div key={index} className="timeline-row">
                  <div className="time-col">{act.time}</div>
                  <div className="marker-col">
                    <div className="dot"></div>
                    {index !== event.activities.length - 1 && <div className="line"></div>}
                  </div>
                  <div className="task-col">{act.task}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="route-highlight-card">
            <div className="route-info">
              <div className="route-icon-box">
                <Navigation size={28} />
              </div>
              <div>
                <h3>The Drive Route</h3>
                <p>Digital roadmap and waypoints included</p>
              </div>
            </div>
            <a href={event.driveRoute} target="_blank" rel="noreferrer" className="btn-gps">
              Open GPS <ExternalLink size={16} />
            </a>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="event-sidebar-column">
          <div className="rsvp-sticky-card">
            <div className="rsvp-info-grid">
              <div className="info-item">
                <div className="info-icon"><Calendar size={18} /></div>
                <div>
                  <label>Date</label>
                  <span>{event.date}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><Clock size={18} /></div>
                <div>
                  <label>Duration</label>
                  <span>{event.time}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MapPin size={18} /></div>
                <div>
                  <label>Start Point</label>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            <div className="attendance-preview">
              <div className="attendee-avatars">
                {[1,2,3].map(i => <div key={i} className="mini-avatar-stack"></div>)}
                <div className="avatar-plus">+{event.attendees - 3}</div>
              </div>
              <span><strong>{event.attendees + (hasRSVPd ? 1 : 0)}</strong> members attending</span>
            </div>

            <button 
              className={`btn-action-primary full-width ${hasRSVPd ? 'success-btn' : ''}`}
              onClick={() => setHasRSVPd(!hasRSVPd)}
            >
              {hasRSVPd ? (
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex-center">
                  <Check size={20} /> I'm Attending
                </motion.div>
              ) : (
                'Accept Invite'
              )}
            </button>

            <button className="btn-action-ghost full-width" onClick={handleShare}>
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div 
                    key="copied"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex-center"
                  >
                    <Check size={18} className="text-green" /> Link Copied
                  </motion.div>
                ) : (
                  <motion.div 
                    key="share"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex-center"
                  >
                    <Share2 size={18} /> Share Meet
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default EventDetail;