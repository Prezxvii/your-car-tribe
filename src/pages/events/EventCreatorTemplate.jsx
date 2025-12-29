import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, Clock, Plus, Trash2, Image as ImageIcon, 
  MapPin, ChevronLeft, Save, Info, Calendar, 
  Loader2, PartyPopper, Eye, Edit3, X, Trophy, AlignLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Events.css';

const EventCreatorTemplate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- Constants ---
  const MAX_TITLE = 50;
  const MAX_DESC = 300;

  // --- States ---
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    routeUrl: '',
    description: '' 
  });
  const [activities, setActivities] = useState([{ time: '08:00', task: 'Meetup & Coffee' }]);
  const [previewImage, setPreviewImage] = useState(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setShowSuccess(true);
      setTimeout(() => navigate('/events'), 3000);
    }, 2000);
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="event-detail-container">
      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div className="success-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="success-modal" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <div className="success-icon-wrap"><PartyPopper size={40} color="white" /></div>
              <h2>Meet is Live!</h2>
              <p>Your event has been broadcasted to the local Tribe.</p>
              <div className="loading-bar-wrap">
                <motion.div className="loading-bar-fill" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="detail-header">
        <div className="header-nav-row">
          <button className="back-btn-glossy" onClick={() => navigate('/events')}>
            <ChevronLeft size={18} /> Cancel
          </button>
          
          <button className="preview-toggle-btn" onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? <><Edit3 size={18} /> Edit Details</> : <><Eye size={18} /> Preview Meet</>}
          </button>
        </div>

        <div className="creator-title-area">
          <span className="event-pill-accent">{isPreview ? 'Previewing' : 'Meet Template'}</span>
          <h1>{isPreview ? (formData.title || "Untitled Meet") : "Host a New Meet"}</h1>
        </div>
      </header>

      {isPreview ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="preview-mode-wrapper">
          <div className="event-hero-banner">
            {previewImage ? <img src={previewImage} alt="Hero" /> : <div className="placeholder-hero"><ImageIcon size={40} color="#cbd5e0" /></div>}
            <div className="hero-overlay-dark"></div>
            <div className="hero-content-text">
              <span className="event-pill-accent">Confirmed Meet</span>
              <h1>{formData.title || "Your Meet Title"}</h1>
              <div className="organizer-chip"><div className="chip-avatar"></div><span>Host: <strong>You</strong></span></div>
            </div>
          </div>

          <div className="event-grid-layout" style={{ marginTop: '40px' }}>
            <div className="event-main-column">
              <section className="detail-card-section">
                <div className="section-title"><Trophy size={20} className="text-blue" /><h2>Overview</h2></div>
                <p className="description-text">{formData.description || "No description provided."}</p>
              </section>
              <section className="detail-card-section">
                <div className="section-title"><Clock size={20} className="text-blue" /><h2>Run Sheet</h2></div>
                <div className="modern-timeline">
                  {activities.map((act, i) => (
                    <div key={i} className="timeline-row">
                      <div className="time-col">{act.time}</div>
                      <div className="marker-col"><div className="dot"></div>{i !== activities.length -1 && <div className="line"></div>}</div>
                      <div className="task-col">{act.task}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <aside className="event-sidebar-column">
              <div className="rsvp-sticky-card">
                 <div className="rsvp-info-grid">
                    <div className="info-item">
                        <Calendar size={18} className="text-blue"/>
                        <div><label>Date</label><span>{formData.date || 'TBD'}</span></div>
                    </div>
                    <div className="info-item">
                        <MapPin size={18} className="text-blue"/>
                        <div><label>Start</label><span>{formData.location || 'TBD'}</span></div>
                    </div>
                 </div>
                <button className="btn-action-primary full-width success-btn" disabled>Publish to See RSVP</button>
              </div>
            </aside>
          </div>
        </motion.div>
      ) : (
        <div className="event-grid-layout">
          <div className="event-main-column">
            <section className="detail-card-section">
              <div className="section-title"><Info size={20} className="text-blue" /> <h2>Meet Essentials</h2></div>
              <div className="creator-form">
                <div className="input-group full">
                  <div className="label-row">
                    <label>Meet Name</label>
                    <span className={`char-count ${formData.title.length >= MAX_TITLE ? 'limit' : ''}`}>
                      {formData.title.length}/{MAX_TITLE}
                    </span>
                  </div>
                  <input 
                    type="text" 
                    maxLength={MAX_TITLE}
                    placeholder="e.g. Skyline Drive Sunday Run" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="input-group full">
                  <div className="label-row">
                    <label><AlignLeft size={14} /> Description</label>
                    <span className={`char-count ${formData.description.length >= MAX_DESC ? 'limit' : ''}`}>
                      {formData.description.length}/{MAX_DESC}
                    </span>
                  </div>
                  <textarea 
                    rows="4"
                    maxLength={MAX_DESC}
                    placeholder="Tell the tribe what to expect (e.g. pace, parking, coffee spots...)" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="creator-textarea"
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label><Calendar size={14} /> Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label><MapPin size={14} /> Starting Point</label>
                    <input type="text" placeholder="City, State" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>

            <section className="detail-card-section">
              <div className="section-title"><Clock size={20} className="text-blue" /> <h2>The Run Sheet</h2></div>
              <div className="timeline-builder">
                {activities.map((act, index) => (
                  <div key={index} className="builder-row">
                    <input type="time" className="time-input" value={act.time} onChange={(e) => {
                      const newActs = [...activities];
                      newActs[index].time = e.target.value;
                      setActivities(newActs);
                    }} />
                    <input type="text" placeholder="Activity name" className="task-input" value={act.task} onChange={(e) => {
                      const newActs = [...activities];
                      newActs[index].task = e.target.value;
                      setActivities(newActs);
                    }} />
                    <button className="btn-delete" onClick={() => setActivities(activities.filter((_, i) => i !== index))}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button className="btn-add-row" onClick={() => setActivities([...activities, {time: '09:00', task: ''}])}>
                  <Plus size={18} /> Add Stop / Activity
                </button>
              </div>
            </section>
          </div>

          <aside className="event-sidebar-column">
            <div className="rsvp-sticky-card">
              <h3>Publishing</h3>
              <div className="image-dropzone" onClick={() => fileInputRef.current.click()}>
                {previewImage ? (
                  <div className="preview-img-container">
                    <img src={previewImage} className="upload-preview-img" alt="Preview" />
                    <button type="button" className="btn-remove-photo" onClick={removeImage}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-empty">
                    <ImageIcon size={30} /> 
                    <span>Add Event Photo</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => setPreviewImage(URL.createObjectURL(e.target.files[0]))} />
              </div>

              <button 
                className={`btn-action-primary full-width ${isPublishing ? 'loading' : ''}`} 
                onClick={handlePublish}
                disabled={isPublishing || !formData.title || !formData.description}
              >
                {isPublishing ? <Loader2 className="spin" size={20} /> : <><Save size={20} /> Publish to Tribe</>}
              </button>
              {!formData.description && <p className="validation-hint">Add a description to publish</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default EventCreatorTemplate;