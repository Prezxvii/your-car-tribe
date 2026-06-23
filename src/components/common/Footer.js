import React from 'react';
import { Link } from 'react-router-dom';

import './Footer.css';

const Footer = () => {
  const userString = localStorage.getItem('user');
  let isAdmin = false;

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
        <div className="footer-brand">
          <Link to="/" className="logo">YCT<span>TRIBE</span></Link>
          <p>The premier destination for the modern car enthusiast.</p>
          
        </div>

        <div className="footer-links">
          <h4>Marketplace</h4>
          <Link to="/">Buy a Car</Link>
          <Link to="/sell">Sell Your Car</Link>
          <Link to="/mechanics">Find a Mechanic</Link>
          <Link to="/events">Local Meets</Link>
        </div>

        <div className="footer-links">
          <h4>Community</h4>
          <Link to="/forum">Forum</Link>
          <Link to="/profile">My License</Link>
          <Link to="/onboarding">Join the Tribe</Link>
          <Link to="#">Code of Conduct</Link>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          {isAdmin && (
            <Link to="/admin-portal" className="admin-link">Admin Portal</Link>
          )}
          <Link to="#">Help Center</Link>
          <Link to="#">Contact Us</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Service</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Your Car Tribe. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;