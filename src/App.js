import React, { useState, useEffect } from 'react'; // Added hooks
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react'; // Added icons

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

// Events Imports
import EventsPage from './pages/events/EventsPage';
import EventDetail from './pages/events/EventDetail'; 
import EventCreatorTemplate from './pages/events/EventCreatorTemplate'; 

// Admin Import
import ModerationDashboard from './pages/admin/ModerationDashboard'; 

// Component Imports
import Footer from './components/common/Footer';

// Styles
import './styles/App.css';
import './styles/Mobile.css'; // New mobile styles

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    closeMenu();
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="logo" onClick={closeMenu}>
              YourCar<span>TRIBE</span>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            <div className="nav-links">
              <Link to="/">Home</Link> 
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/forum">Forum</Link>
              <Link to="/mechanics">Mechanics</Link>
              <Link to="/events">Events</Link>
              <Link to="/sell">Sell</Link>
            </div>

            {/* --- NAV ACTIONS --- */}
            <div className="nav-actions">
              {isLoggedIn ? (
                <Link to="/profile" className="nav-profile-link desktop-only">
                  <User size={20} /> My Garage
                </Link>
              ) : (
                <>
                  <Link to="/login" className="nav-login-link desktop-only">Sign In</Link>
                  <Link to="/onboarding" className="nav-profile-btn desktop-only">Join the Tribe</Link>
                </>
              )}
              
              {/* MOBILE HAMBURGER BUTTON */}
              <button className="mobile-menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* --- MOBILE OVERLAY MENU --- */}
          {isMenuOpen && (
            <div className="mobile-overlay-menu">
              <Link to="/" onClick={closeMenu}>Home</Link>
              <Link to="/marketplace" onClick={closeMenu}>Marketplace</Link>
              <Link to="/forum" onClick={closeMenu}>Forum</Link>
              <Link to="/mechanics" onClick={closeMenu}>Mechanics</Link>
              <Link to="/events" onClick={closeMenu}>Events</Link>
              <Link to="/sell" onClick={closeMenu}>Sell My Car</Link>
              <hr className="menu-divider" />
              {isLoggedIn ? (
                <>
                  <Link to="/profile" onClick={closeMenu}>My Garage</Link>
                  <button onClick={handleLogout} className="mobile-logout-btn">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>Sign In</Link>
                  <Link to="/onboarding" onClick={closeMenu} className="menu-highlight">Join the Tribe</Link>
                </>
              )}
            </div>
          )}
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
            <Route path="/create-event" element={<EventCreatorTemplate />} /> 
            <Route path="/sell" element={<ListingForm />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-portal" element={<ModerationDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;