import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Clock, Share2, Check, Calendar, 
  ChevronLeft, Trophy, ExternalLink, Youtube, X, Maximize2,
  Info // Added this to fix your ESLint error
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import '../../styles/Events.css';

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [hasRSVPd, setHasRSVPd] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/events/${id}`);
        setEvent(data);
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="loading-container">Scanning Dossier...</div>;
  if (!event) return <div className="loading-container">Event not found.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="event-detail-container">
      
      {/* FULL SIZE LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className="close-lightbox"><X size={32} color="white" /></button>
            <img src={event.image} alt="Full Size" className="lightbox-image" />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="detail-header">
        <button className="back-btn-glossy" onClick={() => navigate('/events')}>
          <ChevronLeft size={18} /> Back to Meets
        </button>
        
        <div className="event-hero-banner" onClick={() => setIsLightboxOpen(true)}>
          <img src={event.image} alt="Event Hero" className="hero-img" />
          <div className="hero-overlay-dark"></div>
          
          <div className="hero-zoom-hint">
             <Maximize2 size={20} />
             <span>Click to Expand</span>
          </div>

          <div className="hero-content-text">
            <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="event-pill-accent">
              Confirmed {event.type}
            </motion.span>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {event.title}
            </motion.h1>
            <div className="location-chip-hero">
              <MapPin size={16} />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="event-grid-layout">
        <div className="event-main-column">
          
          <section className="detail-card-section">
            <div className="section-title">
              <Trophy size={20} className="text-blue" />
              <h2>Meet Highlights</h2>
            </div>
            <div className="highlights-display-grid">
              {event.highlights?.map((h, i) => (
                <div key={i} className="highlight-pill-item">
                  <Check size={14} /> {h}
                </div>
              ))}
            </div>
          </section>

          {event.youtubeLinks?.length > 0 && (
            <section className="detail-card-section">
              <div className="section-title">
                <Youtube size={20} color="#FF0000" />
                <h2>Event Media</h2>
              </div>
              <div className="youtube-gallery-grid">
                {event.youtubeLinks.map((link, i) => {
                  const embed = getYoutubeEmbedUrl(link);
                  return embed ? (
                    <div key={i} className="video-container">
                      <iframe src={embed} title={`video-${i}`} allowFullScreen></iframe>
                    </div>
                  ) : null;
                })}
              </div>
            </section>
          )}

          <section className="detail-card-section">
            <div className="section-title">
              <Info size={20} className="text-blue" /> {/* Fixed 'Info' error here */}
              <h2>Description</h2>
            </div>
            <p className="description-text">{event.description}</p>
          </section>
        </div>

        <aside className="event-sidebar-column">
          <div className="rsvp-sticky-card">
            <div className="rsvp-info-grid">
              <div className="info-item">
                <Calendar size={18} className="text-blue" />
                <div>
                  <label>Date</label>
                  <span>{event.date?.month} {event.date?.day}</span>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={18} className="text-blue" />
                <div>
                  <label>Start Point</label>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            <button 
              className={`btn-action-primary full-width ${hasRSVPd ? 'success-btn' : ''}`}
              onClick={() => setHasRSVPd(!hasRSVPd)}
            >
              {hasRSVPd ? <><Check size={20} /> I'm Attending</> : 'Accept Invite'}
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default EventDetail;