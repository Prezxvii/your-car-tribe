import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Page Imports
import Homepage from './pages/home/Homepage'; 
import MarketplaceFeed from './pages/marketplace/MarketplaceFeed';
import ListingForm from './pages/listings/ListingForm';
import ListingDetail from './pages/listings/ListingDetail'; 
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import LoginPage from './pages/onboarding/LoginPage';
import ForgotPassword from './pages/onboarding/ForgotPassword';
import ForumPage from './pages/forum/ForumPage';
import UserProfile from './pages/profile/UserProfile';
import MechanicPage from './pages/mechanics/MechanicPage';

// Events/Admin Imports
import EventsPage from './pages/events/EventsPage';
import EventDetail from './pages/events/EventDetail'; 
import CreateEvent from './pages/events/CreateEvent'; 
import ModerationDashboard from './pages/admin/ModerationDashboard'; 
import Footer from './components/common/Footer';

import './styles/App.css';
import './styles/Mobile.css'; 

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  // ✅ Stable checkAuth with Safety Checks
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // Safety: Check if data exists and is not the literal string "undefined"
    if (token && userData && userData !== "undefined" && userData !== "null") {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setIsAdmin(user?.role === 'admin');
        
        // Priority: username -> fullName -> fallback
        const displayName = user?.username || user?.fullName || 'Tribesman';
        setUserName(displayName);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserName('');
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [checkAuth]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName('');
    closeMenu();
    window.location.href = '/login';
  };

  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    return (isLoggedIn && isAdmin) ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="logo" onClick={closeMenu}>
              YourCar<span>TRIBE</span>
            </Link>

            <div className="nav-links desktop-only">
              <Link to="/">Home</Link> 
              <Link to="/marketplace">Experts</Link> 
              <Link to="/forum">Forum</Link>
              <Link to="/mechanics">Mechanics</Link>
              <Link to="/events">Events</Link>
              <Link to="/sell">Sell</Link>
            </div>

            <div className="nav-actions">
              {isLoggedIn ? (
                <div className="nav-auth-group desktop-only">
                  <span className="welcome-text">Welcome, {userName}</span>
                  <Link to="/profile" className="nav-login-link">
                    <User size={18} /> My Garage
                  </Link>
                  <button onClick={handleLogout} className="nav-logout-inline" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="nav-auth-group desktop-only">
                  <Link to="/login" className="nav-login-link">Sign In</Link>
                  <Link to="/onboarding" className="nav-profile-btn">Join the Tribe</Link>
                </div>
              )}
              
              <button className="mobile-menu-toggle mobile-only" onClick={toggleMenu} aria-label="Toggle Menu">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div 
                  className="mobile-menu-backdrop" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={closeMenu} 
                />
                <motion.div 
                  className="mobile-overlay-menu" 
                  initial={{ x: '100%' }} 
                  animate={{ x: 0 }} 
                  exit={{ x: '100%' }} 
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <div className="mobile-menu-header">
                    {isLoggedIn ? <span>Hi, {userName}</span> : <span>Menu</span>}
                    <button onClick={closeMenu}><X size={24} /></button>
                  </div>
                  <div className="mobile-menu-body">
                    <Link to="/" onClick={closeMenu}>Home <ChevronRight size={16}/></Link>
                    <Link to="/marketplace" onClick={closeMenu}>Experts <ChevronRight size={16}/></Link>
                    <Link to="/forum" onClick={closeMenu}>Forum <ChevronRight size={16}/></Link>
                    <Link to="/mechanics" onClick={closeMenu}>Mechanics <ChevronRight size={16}/></Link>
                    <Link to="/events" onClick={closeMenu}>Events <ChevronRight size={16}/></Link>
                    <Link to="/sell" onClick={closeMenu}>Sell My Car <ChevronRight size={16}/></Link>
                    
                    <div className="menu-divider-label">Account</div>
                    {isLoggedIn ? (
                      <div className="mobile-account-section">
                        <Link to="/profile" onClick={closeMenu} className="menu-sub-link"><User size={18} /> My Garage</Link>
                        <button onClick={handleLogout} className="mobile-logout-btn">
                           <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="mobile-auth-stack">
                        <Link to="/login" onClick={closeMenu} className="mobile-signin-btn">Sign In</Link>
                        <Link to="/onboarding" onClick={closeMenu} className="mobile-join-btn">Join the Tribe</Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>

        <main className="content-area">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/marketplace" element={<MarketplaceFeed />} />
            <Route path="/listing/:id" element={<ListingDetail />} /> 
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/mechanics" element={<MechanicPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetail />} /> 
            
            <Route path="/create-event" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } /> 

            <Route path="/sell" element={<ListingForm />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/admin-portal" element={
              <AdminRoute>
                <ModerationDashboard />
              </AdminRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;