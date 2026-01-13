import React from 'react';
import { User, Wrench, Camera } from 'lucide-react'; // Added Camera
import './ProfileLicense.css';

const ProfileLicense = ({ userData, onPhotoClick }) => {
  const {
    username = "Guest_Enthusiast",
    personalName = "New Member",
    interests = ["Exploring"],
    knowWhats = ["New to the Tribe"],
    avatar = null
  } = userData || {};

  return (
    <div className="license-card">
      <div className="license-header">
        <h2>YOUR CAR TRIBE PROFILE</h2>
        <span className="license-id">#8661-YCT</span>
      </div>

      <div className="license-body">
        <div className="profile-main-info">
          
          {/* THE UPDATED PHOTO BOX */}
          <div className="profile-pic-box" onClick={onPhotoClick}>
            {avatar ? (
              <img src={avatar} alt="Profile" className="license-avatar-img" />
            ) : (
              <>
                <User size={50} color="#ccc" />
                <p>PHOTO</p>
              </>
            )}

            {/* HOVER OVERLAY - Now strictly inside this box */}
            <div className="avatar-mini-overlay">
              <Camera size={20} />
              <span>EDIT</span>
            </div>
          </div>
          
          <div className="info-fields">
            <div className="field">
              <label>USERNAME:</label>
              <span>{username}</span>
            </div>
            <div className="field">
              <label>PERSONAL NAME:</label>
              <span>{personalName}</span>
            </div>
            <div className="field">
              <label>INTERESTS:</label>
              <div className="interest-tags">
                {interests.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="knowledge-section">
          <div className="know-whats-box">
            <h3>KNOW-WHATS:</h3>
            <ul className="knowledge-list">
              {knowWhats.map((item, i) => (
                <li key={i}><Wrench size={12} /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLicense;