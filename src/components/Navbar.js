import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Car, Users, ShoppingBag, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Watch for changes in localStorage (optional but helpful)
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag size={18} /> },
    { name: 'Forum', path: '/forum', icon: <Users size={18} /> },
    { name: 'Events', path: '/events', icon: <Car size={18} /> },
  ];

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    closeMenu();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          TRIBE<span>MARKET</span>
        </Link>

        {/* DESKTOP */}
        <div className="nav-desktop">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="nav-item">
              {link.name}
            </Link>
          ))}
          {isLoggedIn ? (
            <div className="nav-auth-group">
              <Link to="/profile" className="nav-profile-btn"><User size={20} /></Link>
              <button onClick={handleLogout} className="nav-logout-inline"><LogOut size={18} /></button>
            </div>
          ) : (
            <Link to="/login" className="nav-login-link">Sign In</Link>
          )}
        </div>

        {/* MOBILE ICON */}
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close menu when clicking outside */}
            <motion.div 
              className="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            <motion.div 
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="mobile-menu-links">
                <p className="menu-section-label">Navigation</p>
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} onClick={closeMenu} className="mobile-link">
                    {link.icon} {link.name}
                  </Link>
                ))}
                
                <p className="menu-section-label">Account</p>
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" onClick={closeMenu} className="mobile-link">
                      <User size={18} /> My Profile
                    </Link>
                    <button onClick={handleLogout} className="mobile-link logout-btn">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={closeMenu} className="mobile-link login-btn">
                    <User size={18} /> Member Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;