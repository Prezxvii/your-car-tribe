import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Car, Users, User, LogOut, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      setIsLoggedIn(!!token);

      // ✅ Added safety check for "undefined" or null strings
      if (token && userData && userData !== "undefined" && userData !== "null") {
        try {
          const user = JSON.parse(userData);
          // ✅ PRIORITY: username (Pablo) -> fullName (Pablo Moore) -> fallback
          const nameToDisplay = user.username || user.fullName || 'Tribesman';
          setUserName(nameToDisplay);
        } catch (e) {
          console.error("Auth parsing error in Navbar:", e);
          setUserName('Tribesman');
        }
      } else {
        setUserName('');
      }
    };

    // Initial check
    checkAuth();

    // ✅ Listen for both cross-tab changes and manual dispatches (Onboarding)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const navLinks = [
    { name: 'Experts', path: '/marketplace', icon: <Wrench size={18} /> },
    { name: 'Forum', path: '/forum', icon: <Users size={18} /> },
    { name: 'Events', path: '/events', icon: <Car size={18} /> },
  ];

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
    closeMenu();
    navigate('/login');
    // ✅ Ensure other components know the user logged out
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          YourCar<span>TRIBE</span>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="nav-desktop">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="nav-item">
              {link.name}
            </Link>
          ))}
          
          {isLoggedIn ? (
            <div className="nav-auth-group">
              <span className="welcome-msg">Welcome, {userName}</span>
              <Link to="/profile" className="nav-profile-btn" title="My Garage">
                <User size={20} />
              </Link>
              <button onClick={handleLogout} className="nav-logout-inline" title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="nav-guest-group">
              <Link to="/login" className="nav-login-link">Sign In</Link>
              <Link to="/onboarding" className="nav-join-btn">Join the Tribe</Link>
            </div>
          )}
        </div>

        {/* --- MOBILE ICON --- */}
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {isOpen && (
          <>
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
              <div className="mobile-menu-content">
                <div className="mobile-menu-header">
                   {isLoggedIn ? `Hi, ${userName}` : "Menu"}
                </div>

                <p className="menu-section-label">Explore</p>
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} onClick={closeMenu} className="mobile-link">
                    {link.icon} {link.name}
                  </Link>
                ))}
                
                <p className="menu-section-label">Account</p>
                {isLoggedIn ? (
                  <div className="mobile-auth-links">
                    <Link to="/profile" onClick={closeMenu} className="mobile-link">
                      <User size={18} /> My Garage
                    </Link>
                    <button onClick={handleLogout} className="mobile-link logout-action">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mobile-auth-stack">
                    <Link to="/login" onClick={closeMenu} className="mobile-link login-btn">
                      Sign In
                    </Link>
                    <Link to="/onboarding" onClick={closeMenu} className="mobile-link join-btn">
                      Join the Tribe
                    </Link>
                  </div>
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