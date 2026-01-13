import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Camera, Info, Save, ChevronLeft, 
  Users, Upload, Youtube, Plus, X, ListChecks 
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../../config/api';
import '../../styles/CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [youtubeLinks, setYoutubeLinks] = useState(['']);
  const [highlights, setHighlights] = useState(['']);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'Meetup',
    dateDay: '--',
    dateMonth: '---',
    fullDate: '',
    image: '',
    description: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // YouTube Logic
  const handleAddYoutube = () => setYoutubeLinks([...youtubeLinks, '']);
  const updateYoutube = (index, val) => {
    const newLinks = [...youtubeLinks];
    newLinks[index] = val;
    setYoutubeLinks(newLinks);
  };
  const removeYoutube = (index) => setYoutubeLinks(youtubeLinks.filter((_, i) => i !== index));

  // Highlights Logic
  const handleAddHighlight = () => setHighlights([...highlights, '']);
  const updateHighlight = (index, val) => {
    const newHighlights = [...highlights];
    newHighlights[index] = val;
    setHighlights(newHighlights);
  };
  const removeHighlight = (index) => setHighlights(highlights.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        location: formData.location,
        type: formData.type,
        date: {
          day: formData.dateDay,
          month: formData.dateMonth,
          fullDate: new Date(formData.fullDate)
        },
        youtubeLinks: youtubeLinks.filter(l => l.trim() !== ''),
        highlights: highlights.filter(h => h.trim() !== ''),
        image: formData.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
        description: formData.description
      };

      await axios.post(`${API_BASE_URL}/api/events`, payload);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0066ff', '#1a1a1a', '#ffffff']
      });

      setTimeout(() => navigate('/events'), 2000);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Error creating event. Check image size or network.");
    }
  };

  return (
    <div className="create-event-container">
      <button onClick={() => navigate('/events')} className="btn-back-link">
        <ChevronLeft size={16} /> Back to Events
      </button>

      <div className="create-grid">
        <div className="form-card card">
          <header className="form-header">
            <h1>Set Up a Tribe Meet</h1>
            <p>Register your event in the local Dossier.</p>
          </header>

          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-section">
              <label><Info size={16} /> Event Title</label>
              <input 
                name="title"
                type="text" 
                placeholder="e.g., Morning Shift: Cars & Coffee"
                required
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-section">
                <label><MapPin size={16} /> Location (City, State)</label>
                <input 
                  name="location"
                  type="text" 
                  placeholder="Mt Vernon, NY"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-section">
                <label>Event Type</label>
                <select name="type" onChange={handleInputChange}>
                  <option value="Meetup">Meetup</option>
                  <option value="Track Day">Track Day</option>
                  <option value="Cruise">Cruise</option>
                  <option value="Show">Car Show</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-section">
                <label><Calendar size={16} /> Date</label>
                <input 
                  type="date" 
                  required
                  onChange={(e) => {
                    if(!e.target.value) return;
                    const d = new Date(e.target.value + 'T00:00:00');
                    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
                    setFormData({
                      ...formData, 
                      fullDate: e.target.value,
                      dateDay: d.getDate().toString().padStart(2, '0'),
                      dateMonth: months[d.getMonth()]
                    });
                  }}
                />
              </div>
              
              <div className="form-section">
                <label><Camera size={16} /> Event Banner</label>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button 
                  type="button" 
                  className="btn-upload-trigger"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload size={16} /> {isUploading ? "Processing..." : "Upload Photo"}
                </button>
              </div>
            </div>

            <div className="form-section">
              <label><Youtube size={16} color="#FF0000" /> YouTube Media (Walkarounds / Hype)</label>
              {youtubeLinks.map((link, index) => (
                <div key={index} className="dynamic-input-group">
                  <input 
                    type="text" 
                    placeholder="Paste YouTube URL"
                    value={link}
                    onChange={(e) => updateYoutube(index, e.target.value)}
                  />
                  {youtubeLinks.length > 1 && (
                    <button type="button" onClick={() => removeYoutube(index)}><X size={16}/></button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-detail" onClick={handleAddYoutube}>
                <Plus size={14} /> Add Another Video
              </button>
            </div>

            <div className="form-section">
              <label><ListChecks size={16} /> Highlights (Rules, Radios, Points)</label>
              {highlights.map((h, index) => (
                <div key={index} className="dynamic-input-group">
                  <input 
                    type="text" 
                    placeholder="e.g., Radio Frequency: 5.0"
                    value={h}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                  />
                  {highlights.length > 1 && (
                    <button type="button" onClick={() => removeHighlight(index)}><X size={16}/></button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-detail" onClick={handleAddHighlight}>
                <Plus size={14} /> Add Highlight
              </button>
            </div>

            <div className="form-section">
              <label>General Description</label>
              <textarea 
                name="description"
                placeholder="Detailed info..."
                rows="3"
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="btn-submit-event">
              <Save size={18} /> Publish to Tribe
            </button>
          </form>
        </div>

        <div className="preview-sticky">
          <div className="preview-label">Live Preview</div>
          <div className="event-card preview-card">
            <div className="event-date-badge">
              <span className="month">{formData.dateMonth || '---'}</span>
              <span className="day">{formData.dateDay || '--'}</span>
            </div>
            <div className="event-image">
              <img src={formData.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'} alt="Preview" />
              {/* THIS IS THE LOCATION OVERLAY */}
              <div className="image-location-tag">
                <MapPin size={12} />
                <span>{formData.location || 'Location'}</span>
              </div>
            </div>
            <div className="event-details">
              <span className="event-type-pill">{formData.type}</span>
              <h3>{formData.title || 'Your Event Title'}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;