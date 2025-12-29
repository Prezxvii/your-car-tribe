import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Car } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Brand & Newsletter */}
        <div className="footer-brand">
          <Link to="/" className="logo">YCT<span>TRIBE</span></Link>
          <p>The premier destination for the modern car enthusiast.</p>
          <div className="newsletter">
            <input type="email" placeholder="Join the newsletter" />
            <button><Mail size={18} /></button>
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
          <Link to="/admin-portal" className="admin-link">Admin Portal</Link>
          <Link to="#">Help Center</Link>
          <Link to="#">Contact Us</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Service</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 Your Car Tribe. All rights reserved.</p>
          <div className="social-icons">
            <Instagram size={20} />
            <Twitter size={20} />
            <Facebook size={20} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;