import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  // 1. Get user data safely
  const userString = localStorage.getItem('user');
  let isAdmin = false;

  // 2. Parse and verify role with safety check
  // Added check for "undefined" string which causes the crash
  if (userString && userString !== "undefined" && userString !== "null") {
    try {
      const userData = JSON.parse(userString);
      isAdmin = userData?.role === 'admin';
    } catch (error) {
      console.error("Error parsing user data for admin check", error);
    }
  }

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Brand & Newsletter */}
        <div className="footer-brand">
          <Link to="/" className="logo">YCT<span>TRIBE</span></Link>
          <p>The premier destination for the modern car enthusiast.</p>
          <div className="newsletter">
            <input type="email" placeholder="Join the newsletter" />
            <button aria-label="Subscribe"><Mail size={18} /></button>
          </div>
        </div>

        {/* Links: Marketplace */}
        <div className="footer-links">
          <h4>Marketplace</h4>
          <Link to="/">Buy a Car</Link>
          <Link to="/sell">Sell Your Car</Link>
          <Link to="/mechanics">Find a Mechanic</Link>
          <Link to="/events">Local Meets</Link>
        </div>

        {/* Links: Community */}
        <div className="footer-links">
          <h4>Community</h4>
          <Link to="/forum">Forum</Link>
          <Link to="/profile">My License</Link>
          <Link to="/onboarding">Join the Tribe</Link>
          <Link to="#">Code of Conduct</Link>
        </div>

        {/* Links: Support */}
        <div className="footer-links">
          <h4>Support</h4>
          
          {/* Only show Admin Portal link if isAdmin is true */}
          {isAdmin && (
            <Link to="/admin-portal" className="admin-link" style={{color: '#ff4d4d', fontWeight: 'bold'}}>Admin Portal</Link>
          )}
          
          <Link to="#">Help Center</Link>
          <Link to="#">Contact Us</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Service</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Your Car Tribe. All rights reserved.</p>
          <div className="social-icons">
            <Instagram size={20} style={{cursor: 'pointer'}} />
            <Twitter size={20} style={{cursor: 'pointer'}} />
            <Facebook size={20} style={{cursor: 'pointer'}} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;