import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Save, Check, Loader2, Plus, X, 
  Trash2, ExternalLink, Calendar, Users, Camera 
} from 'lucide-react';
import ProfileLicense from '../../components/profile/ProfileLicense';
import '../../styles/Profile.css';
import { API_BASE_URL } from '../../config/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userTribes, setUserTribes] = useState([]);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [knowWhats, setKnowWhats] = useState(["Active Contributor", "Tribe Member"]);
  const [newKnowWhat, setNewKnowWhat] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [myEvents, setMyEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const vehicleCategories = ['JDM', 'Euro', 'Muscle', 'Off-Road', 'Classics'];
  const eventCategories = ['Track Days', 'Cars and Coffee', 'Night Drives', 'Drifting', 'DIY'];

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedTribes = localStorage.getItem('userTribes');
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar');
    const savedKnowWhats = localStorage.getItem('userKnowWhats');

    if (savedName) setUserName(savedName);
    if (savedTribes) setUserTribes(JSON.parse(savedTribes) || []);
    if (savedAvatar) setAvatar(savedAvatar);
    if (savedKnowWhats) setKnowWhats(JSON.parse(savedKnowWhats) || []);

    const fetchMyEvents = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/events`);
        const filtered = data.filter(ev => ev.creator === storedUser._id);
        setMyEvents(filtered);
      } catch (err) {
        console.error("Error fetching your events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (storedUser._id) fetchMyEvents();
  }, [storedUser._id]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this meet? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
      setMyEvents(prev => prev.filter(ev => ev._id !== eventId));
      setMessage('Event Scrubbed!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert("Failed to delete event.");
    }
  };

  // --- COMPRESSION LOGIC ---
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Resizing for the license card
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress to JPEG at 70% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setAvatar(dataUrl);
        setMessage('Photo optimized. Sync to save!');
        setTimeout(() => setMessage(''), 3000);
      };
    };
  };

  const toggleTribe = (tribe) => {
    setUserTribes(prev =>
      prev.includes(tribe) ? prev.filter(t => t !== tribe) : [...prev, tribe]
    );
  };

  const addKnowWhat = () => {
    if (newKnowWhat.trim() && knowWhats.length < 4) {
      setKnowWhats([...knowWhats, newKnowWhat.trim()]);
      setNewKnowWhat('');
    }
  };

  const removeKnowWhat = (index) => {
    setKnowWhats(knowWhats.filter((_, i) => i !== index));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/auth/update-profile`,
        { tribes: userTribes, avatar, knowWhats },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem('userTribes', JSON.stringify(userTribes));
      localStorage.setItem('userAvatar', avatar || "");
      localStorage.setItem('userKnowWhats', JSON.stringify(knowWhats));

      const updatedFullUser = { ...storedUser, tribes: userTribes, profilePhoto: avatar, knowWhats };
      localStorage.setItem('user', JSON.stringify(updatedFullUser));

      window.dispatchEvent(new Event("storage"));
      setMessage('Profile Synced!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <section className="license-display-section">
        <div className="license-relative-wrapper">
          <ProfileLicense 
            userData={{ 
              username: userName || "Enthusiast", 
              personalName: "Verified Member", 
              interests: userTribes, 
              knowWhats, 
              avatar 
            }} 
            onPhotoClick={() => document.getElementById('avatar-upload').click()}
          />
          
          <input 
            type="file" 
            id="avatar-upload" 
            onChange={handleAvatarChange} 
            accept="image/*" 
            hidden 
          />
        </div>

        <div className="status-stats-bar card">
          <div className="stat-item">
            <Calendar size={18} />
            <div>
              <span className="stat-value">{myEvents.length}</span>
              <span className="stat-label">Meets Hosted</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <Users size={18} />
            <div>
              <span className="stat-value">Tribe</span>
              <span className="stat-label">Verified Member</span>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-content-area">
        <div className="settings-card card mb-20">
          <div className="settings-header">
            <Calendar size={22} className="blue-gear-icon" /> 
            <h2>My Hosted Meets</h2>
          </div>
          
          <div className="manage-events-list">
            {loadingEvents ? <Loader2 className="spinner" /> : 
             myEvents.length > 0 ? (
              myEvents.map(event => (
                <div key={event._id} className="manage-event-row">
                  <div className="manage-event-info">
                    <strong>{event.title}</strong>
                    <span>{event.date.month} {event.date.day} • {event.location}</span>
                  </div>
                  <div className="manage-event-actions">
                    <button className="icon-btn" onClick={() => navigate(`/events/${event._id}`)}>
                      <ExternalLink size={18} />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteEvent(event._id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-msg">You haven't set up any meets yet.</p>
            )}
          </div>
        </div>

        <div className="settings-card card">
          <div className="settings-header">
            <Settings size={22} className="blue-gear-icon" /> 
            <h2>Driver Settings</h2>
          </div>

          <div className="settings-group">
            <label className="group-label">Expertise (Know-whats)</label>
            <div className="know-whats-edit-list">
              {knowWhats.map((item, idx) => (
                <div key={idx} className="know-what-tag">
                  {item} <X size={12} onClick={() => removeKnowWhat(idx)} />
                </div>
              ))}
            </div>
            {knowWhats.length < 4 && (
              <div className="add-know-what">
                <input 
                  type="text" 
                  value={newKnowWhat} 
                  onChange={(e) => setNewKnowWhat(e.target.value)} 
                  placeholder="e.g. Engine Tuning" 
                />
                <button onClick={addKnowWhat}><Plus size={16} /></button>
              </div>
            )}
          </div>

          <hr className="settings-divider" />

          <div className="settings-group">
            <label className="group-label">Vehicle Kinds</label>
            <div className="tribes-selection-grid">
              {vehicleCategories.map(tribe => (
                <button 
                  key={tribe} 
                  className={`tribe-pill ${userTribes.includes(tribe) ? 'active' : ''}`} 
                  onClick={() => toggleTribe(tribe)}
                >
                  {tribe} {userTribes.includes(tribe) && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn-save-settings" onClick={savePreferences} disabled={saving}>
              {saving ? <Loader2 className="spinner" size={18} /> : <><Save size={18} /> Sync to License</>}
            </button>
            {message && <span className="status-msg">{message}</span>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
