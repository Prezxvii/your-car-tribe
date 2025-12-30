import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronRight, LogOut, Newspaper, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileLicense from '../../components/profile/ProfileLicense';
import '../../styles/Home.css';

const Homepage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('JDM'); 
  const [userTribes, setUserTribes] = useState([]);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localNews, setLocalNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const savedTribes = localStorage.getItem('userTribes');
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar');
    const token = localStorage.getItem('token');
    
    setIsLoggedIn(!!token);
    if (savedName) setUserName(savedName);
    if (savedAvatar) setAvatar(savedAvatar);
    if (savedTribes) {
      const tribes = JSON.parse(savedTribes);
      setUserTribes(tribes);
      if (tribes.length > 0) setActiveTab(tribes[0]);
    }

    const fetchNews = async () => {
      try {
        // CALLING YOUR BACKEND PROXY INSTEAD OF EXTERNAL API
        const response = await fetch('http://localhost:5000/api/news/car-news');
        const data = await response.json();
        setLocalNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/login');
  };

  const licenseData = {
    username: userName || "Enthusiast",
    personalName: "Verified Member",
    interests: userTribes.length > 0 ? userTribes : ["No Tribes Joined"],
    knowWhats: ["Active Contributor", "Tribe Member"],
    avatar: avatar 
  };

  const feedContent = [
    { id: 1, type: 'article', tag: 'Technical', title: 'RB26 vs 2JZ: The Final Verdict', author: 'Expert_Spec', interest: 'JDM', desc: 'Exploring the engines that defined a generation.' },
    { id: 2, type: 'listing', tag: 'Marketplace', title: '1993 Mazda RX-7 FD', price: '$42,000', interest: 'JDM', location: 'Los Angeles, CA' },
    { id: 4, type: 'listing', tag: 'Marketplace', title: '1969 Mustang Fastback', price: '$55,000', interest: 'Muscle', location: 'Austin, TX' },
    { id: 5, type: 'article', tag: 'Guide', title: 'Restoring E30 Interiors', author: 'BimmerDude', interest: 'Euro', desc: 'How to source OEM fabric.' },
  ];

  return (
    <div className="home-container">
      <section className="home-hero-section">
        <div className="hero-overlay"></div>
        {isLoggedIn && (
          <div className="sign-out-tab" onClick={handleLogout}>
            <LogOut size={16} /> <span>Sign Out</span>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="hero-text-block">
          <span className="welcome-badge">Welcome back, {userName || 'Enthusiast'}</span>
          <h1>Who we are</h1>
          <p className="client-copy">
            We are committed to bring cars and community together. This starts with 
            connecting the right people and a space to meet. <strong>Welcome!</strong>
          </p>
          <div className="hero-cta-group">
            <button className="btn-primary-glow" onClick={() => navigate('/marketplace')}>Marketplace</button>
            <button className="btn-outline-white" onClick={() => navigate('/events')}>Find a Meet</button>
          </div>
        </motion.div>
      </section>

      {isLoggedIn && (
        <section className="home-dashboard-section">
          <div className="home-dashboard-inner">
            <div className="dashboard-text">
              <div className="status-indicator">
                <div className="dot"></div>
                <span>ACTIVE MEMBER SESSION</span>
              </div>
              <h2>Member Dashboard</h2>
              <p>Quick access to your driver profile, saved vehicles, and tribe settings.</p>
              <div className="quick-stats">
                <div className="q-stat"><strong>{userTribes.length}</strong><span>Tribes</span></div>
                <div className="q-stat"><strong>0</strong><span>Garage Items</span></div>
              </div>
              <button className="btn-manage-profile" onClick={() => navigate('/profile')}>
                Manage Account <User size={18} />
              </button>
            </div>
            <div className="license-preview-container" onClick={() => navigate('/profile')}>
              <div className="license-hover-hint">View My Profile License</div>
              <ProfileLicense userData={licenseData} />
            </div>
          </div>
        </section>
      )}

      <div className="home-main-layout">
        <div className="home-feed-section">
          <div className="feed-nav">
            <div className="tabs">
              {(userTribes.length > 0 ? userTribes : ['JDM', 'Muscle', 'Euro']).map(tab => (
                <button key={tab} className={activeTab === tab ? 'tab-active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </div>
          </div>
          <div className="home-content-grid">
            <AnimatePresence mode="wait">
              {feedContent.filter(item => item.interest === activeTab).map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`content-card ${item.type}`}>
                  <span className="content-badge">{item.tag}</span>
                  <h3>{item.title}</h3>
                  {item.type === 'listing' ? <p className="price-text">{item.price}</p> : <p className="desc-text">{item.desc}</p>}
                  <button className="card-action-btn">View {item.type === 'listing' ? 'Listing' : 'Story'} <ChevronRight size={16} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <aside className="home-news-sidebar">
          <div className="news-header"><Newspaper size={20} /><h3>NYC Car News</h3></div>
          <div className="news-list">
            {newsLoading ? (
              <p>Loading news...</p>
            ) : (
              localNews.map((article, idx) => (
                <div key={idx} className="news-item" onClick={() => window.open(article.url, '_blank')}>
                  <h4>{article.title}</h4>
                  <div className="news-meta">
                    <span>{article.source.name}</span> • <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="view-all-news">Stay Updated</button>
        </aside>
      </div>

      <section className="value-banner">
        <div className="banner-inner">
          <div className="banner-icon-box"><Users size={40} /></div>
          <div className="banner-text">
            <h2>Why use this platform?</h2>
            <p className="client-copy-alt">
              Why not get advice, find products and vehicles from people who are proven 
              to know what they are talking about? This is the place to find all you need 
              to know about cars, the people who work on them and keep the community alive.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;