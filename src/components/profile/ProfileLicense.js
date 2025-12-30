import React from 'react';
import { User, Wrench, } from 'lucide-react';
import './ProfileLicense.css';

const ProfileLicense = ({ userData }) => {
  // If no data is passed, we use defaults
  const data = userData || {
    username: "Guest_Enthusiast",
    personalName: "New Member",
    interests: ["Exploring"],
    knowWhats: ["New to the Tribe"]
  };

  return (
    <div className="license-card">
      <div className="license-header">
        <h2>YOUR CAR TRIBE PROFILE</h2>
        <span className="license-id">#8661-YCT</span>
      </div>

      <div className="license-body">
        <div className="profile-main-info">
          <div className="profile-pic-box">
            <User size={50} color="#ccc" />
            <p>PHOTO</p>
          </div>
          
          <div className="info-fields">
            <div className="field">
              <label>USERNAME:</label>
              <span>{data.username}</span>
            </div>
            <div className="field">
              <label>PERSONAL NAME:</label>
              <span>{data.personalName}</span>
            </div>
            <div className="field">
              <label>INTERESTS:</label>
              <div className="interest-tags">
                {data.interests.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="knowledge-section">
          <div className="know-whats-box">
            <h3>KNOW-WHATS:</h3>
            <ul className="knowledge-list">
              {data.knowWhats.map((item, i) => (
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