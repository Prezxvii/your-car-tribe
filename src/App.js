import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

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
import EventCreatorTemplate from './pages/events/EventCreatorTemplate'; // New Member Template

// Admin Import
import ModerationDashboard from './pages/admin/ModerationDashboard'; 

// Component Imports
import Footer from './components/common/Footer';

// Styles
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <nav className="main-nav">
          <div className="nav-container">
            <Link to="/" className="logo">YourCar<span>TRIBE</span></Link>
            <div className="nav-links">
              <Link to="/">Home</Link> 
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/forum">Forum</Link>
              <Link to="/mechanics">Mechanics</Link>
              <Link to="/events">Events</Link>
              <Link to="/sell">Sell</Link>
            </div>
            <div className="nav-actions">
              <Link to="/login" className="nav-login-link">Sign In</Link>
              <Link to="/onboarding" className="nav-profile-btn">Join the Tribe</Link>
            </div>
          </div>
        </nav>

        <main className="content-area">
          <Routes>
            {/* Core Features */}
            <Route path="/" element={<Homepage />} />
            <Route path="/marketplace" element={<MarketplaceFeed />} />
            <Route path="/listing/:id" element={<ListingDetail />} /> 
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/mechanics" element={<MechanicPage />} />
            
            {/* Events System */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetail />} /> 
            <Route path="/create-event" element={<EventCreatorTemplate />} /> {/* Member Tool */}
            
            {/* User Account & Onboarding */}
            <Route path="/sell" element={<ListingForm />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Restricted Admin Portal */}
            <Route path="/admin-portal" element={<ModerationDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;