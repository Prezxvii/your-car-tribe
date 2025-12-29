import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Check, LogOut, Loader2, Camera } from 'lucide-react';
import ProfileLicense from '../../components/profile/ProfileLicense';
import '../../styles/Profile.css';

const UserProfile = () => {
  const [userTribes, setUserTribes] = useState([]);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null); // Holds the image file or URL
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const allAvailableTribes = ['JDM', 'Euro', 'Muscle', 'Off-Road', 'Track Days', 'DIY', 'Classics', 'Drifting'];

  useEffect(() => {
    const savedTribes = localStorage.getItem('userTribes');
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar'); // We'll store the URL here
    
    if (savedName) setUserName(savedName);
    if (savedTribes) setUserTribes(JSON.parse(savedTribes));
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  // --- AVATAR UPLOAD HANDLER ---
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // This is a Base64 string for immediate preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const toggleTribe = (tribe) => {
    setUserTribes(prev => 
      prev.includes(tribe) ? prev.filter(t => t !== tribe) : [...prev, tribe]
    );
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // If we were using a real backend, we'd use FormData to send the image file
      await axios.put('http://localhost:5000/api/auth/update-profile', 
        { tribes: userTribes, avatar: avatar },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      localStorage.setItem('userTribes', JSON.stringify(userTribes));
      localStorage.setItem('userAvatar', avatar);
      setMessage('Profile Updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const licenseData = {
    username: userName || "Enthusiast",
    personalName: "Verified Member",
    interests: userTribes,
    knowWhats: ["Active Contributor", "Tribe Member"],
    avatar: avatar // Pass the avatar to the license component
  };

  return (
    <div className="profile-page-wrapper">
      
      {/* 1. THE VISUAL LICENSE */}
      <section className="license-display-section">
        <div className="license-relative-wrapper">
          <ProfileLicense userData={licenseData} />
          
          {/* Hidden File Input triggered by the License's CSS hover state */}
          <input 
            type="file" 
            id="avatar-input" 
            onChange={handleAvatarChange} 
            accept="image/*" 
            hidden 
          />
        </div>
      </section>

      {/* 2. MANAGE TRIBES SECTION */}
      <section className="settings-content-area">
        <div className="settings-card card">
          <div className="settings-header">
            <Settings size={20} color="#0066ff" />
            <h2>Driver Settings</h2>
            <button className="btn-logout-minimal" onClick={handleSignOut}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
          
          <div className="tribes-selection-grid">
            {allAvailableTribes.map(tribe => (
              <button 
                key={tribe}
                className={`tribe-pill ${userTribes.includes(tribe) ? 'active' : ''}`}
                onClick={() => toggleTribe(tribe)}
              >
                {tribe} {userTribes.includes(tribe) && <Check size={14} />}
              </button>
            ))}
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