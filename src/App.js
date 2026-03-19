import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Component Imports
import Navbar from './components/Navbar'; 
import Footer from './components/common/Footer';

// Page Imports
import Homepage from './pages/home/Homepage'; 
import NewsPage from './pages/news/NewsPage'; // ✅ Added NewsPage
import MarketplaceFeed from './pages/marketplace/MarketplaceFeed';
import ListingForm from './pages/listings/ListingForm';
import ListingDetail from './pages/listings/ListingDetail'; 
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import LoginPage from './pages/onboarding/LoginPage';
import ForgotPassword from './pages/onboarding/ForgotPassword';
import ForumPage from './pages/forum/ForumPage';
import UserProfile from './pages/profile/UserProfile';
import MechanicPage from './pages/mechanics/MechanicPage';
import EventsPage from './pages/events/EventsPage';
import EventDetail from './pages/events/EventDetail'; 
import CreateEvent from './pages/events/CreateEvent'; 
import ModerationDashboard from './pages/admin/ModerationDashboard'; 

// Styles
import './styles/App.css';
import './styles/Mobile.css'; 

// ✅ Helper to reset scroll position on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && userData !== "undefined" && userData !== "null") {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setIsAdmin(user?.role === 'admin');
      } catch (error) {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [checkAuth]);

  // --- Route Guards ---
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    return (isLoggedIn && isAdmin) ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <ScrollToTop /> {/* ✅ Ensures page starts at top on route change */}
      <div className="app-wrapper">
        
        <Navbar />

        <main className="content-area">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/news" element={<NewsPage />} /> {/* ✅ New News Route */}
            <Route path="/marketplace" element={<MarketplaceFeed />} />
            <Route path="/listing/:id" element={<ListingDetail />} /> 
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/mechanics" element={<MechanicPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetail />} /> 
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route path="/create-event" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } /> 
            <Route path="/sell" element={
              <ProtectedRoute>
                <ListingForm />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            {/* Admin Only Routes */}
            <Route path="/admin-portal" element={
              <AdminRoute>
                <ModerationDashboard />
              </AdminRoute>
            } />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;