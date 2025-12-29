import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Camera, Share2, Check } from 'lucide-react';
import '../../styles/Events.css';

const EventCreator = () => {
  const [isPosted, setIsPosted] = useState(false);

  return (
    <div className="event-creator-container card">
      <h2>Set Up a Meet</h2>
      <p className="subtitle">Create a template for your next car meat.</p>

      <form className="event-template-form" onSubmit={(e) => { e.preventDefault(); setIsPosted(true); }}>
        <div className="form-group">
          <label><MapPin size={16} /> Meeting Location</label>
          <input type="text" placeholder="e.g., Bear Mountain Lower Lot" required />
        </div>

        <div className="form-group">
          <label><Navigation size={16} /> Potential Drive (Route Link)</label>
          <input type="text" placeholder="Paste Google Maps or Waze link" />
        </div>

        <div className="form-group">
          <label><Clock size={16} /> Activities & Times</label>
          <textarea placeholder="9:00 AM - Arrival&#10;10:30 AM - Drivers meeting&#10;11:00 AM - Departure" required />
        </div>

        <div className="photo-upload-zone">
          <Camera size={32} />
          <p>Add photos of the meeting spot</p>
          <input type="file" multiple className="file-input" />
        </div>

        <div className="social-toggle">
          <label className="switch-label">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
            Allow others to accept invite & share to social media
          </label>
        </div>

        <button type="submit" className="btn-post-event">
          {isPosted ? <><Check size={18} /> Event Posted!</> : 'Post Event'}
        </button>
      </form>
    </div>
  );
};

export default EventCreator;