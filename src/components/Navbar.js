import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Car, Users, User, LogOut, Wrench, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Navbar.css'; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (token && userData && userData !== "undefined" && userData !== "null") {
      try {
        const user = JSON.parse(userData);
        setUserName(user.username || user.fullName || 'Tribesman');
      } catch (e) { setUserName('Tribesman'); }
    } else { setUserName(''); }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // ✅ FIX: Auto-close menu if user expands screen to desktop
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsOpen(false);
    };

    window.addEventListener('storage', checkAuth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkAuth]);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Car size={18} /> },
    { name: 'Experts', path: '/marketplace', icon: <Wrench size={18} /> },
    { name: 'Forum', path: '/forum', icon: <Users size={18} /> },
    { name: 'Mechanics', path: '/mechanics', icon: <Wrench size={18} /> },
    { name: 'Events', path: '/events', icon: <Car size={18} /> },
    { name: 'Sell', path: '/sell', icon: <Car size={18} /> },
  ];

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
    closeMenu();
    navigate('/login');
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          YourCar<span>TRIBE</span>
        </Link>

        <div className="nav-desktop">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="nav-item">{link.name}</Link>
          ))}
        </div>

        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="nav-auth-group desktop-only">
              <span className="welcome-msg">Welcome, {userName}</span>
              <Link to="/profile" className="nav-profile-btn"><User size={20} /></Link>
              <button onClick={handleLogout} className="nav-logout-inline"><LogOut size={18} /></button>
            </div>
          ) : (
            <div className="nav-guest-group desktop-only">
              <Link to="/login" className="nav-login-link">Sign In</Link>
              <Link to="/onboarding" className="nav-join-btn">Join the Tribe</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

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
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                 <span>{isLoggedIn ? `Hi, ${userName}` : "Menu"}</span>
                 <button onClick={closeMenu} className="close-drawer"><X size={24}/></button>
              </div>

              <div className="drawer-body">
                <p className="section-label">Explore</p>
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} onClick={closeMenu} className="drawer-link">
                    <span className="link-content">{link.icon} {link.name}</span>
                    <ChevronRight size={16} />
                  </Link>
                ))}
                
                <p className="section-label">Account</p>
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" onClick={closeMenu} className="drawer-link">
                      <span className="link-content"><User size={18} /> My Garage</span>
                    </Link>
                    <button onClick={handleLogout} className="drawer-logout">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="drawer-auth-stack">
                    <Link to="/login" onClick={closeMenu} className="drawer-signin">Sign In</Link>
                    <Link to="/onboarding" onClick={closeMenu} className="drawer-join">Join the Tribe</Link>
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