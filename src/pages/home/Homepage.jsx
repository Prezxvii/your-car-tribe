// ========================================
// UPDATED HOMEPAGE WITH FORCED DESCRIPTIONS
// File: src/pages/Homepage/Homepage.jsx
// ========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronRight, Newspaper, User, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileLicense from '../../components/profile/ProfileLicense';
import '../../styles/Home.css';
import { API_BASE_URL } from '../../config/api';

const Homepage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('JDM');
  const [userTribes, setUserTribes] = useState([]);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localNews, setLocalNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

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
        setNewsLoading(true);
        setNewsError(null);
        const response = await fetch(`${API_BASE_URL}/api/news/car-news`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        
        // ✅ DETAILED DEBUG
        console.log('📰 Full news response:', data);
        if (data && data.length > 0) {
          console.log('First article FULL:', data[0]);
          console.log('Description field:', data[0].description);
          console.log('Description type:', typeof data[0].description);
          console.log('Description length:', data[0].description?.length);
        }
        
        setLocalNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsError(error.message);
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
    username: userName || 'Enthusiast',
    personalName: 'Verified Member',
    interests: userTribes.length > 0 ? userTribes : ['No Tribes Joined'],
    knowWhats: ['Active Contributor', 'Tribe Member'],
    avatar
  };

  const feedContent = [
    { id: 1, type: 'article', tag: 'Technical', title: 'RB26 vs 2JZ: The Final Verdict', author: 'Expert_Spec', interest: 'JDM', desc: 'Exploring the engines that defined a generation.' },
    { id: 2, type: 'listing', tag: 'Experts', title: '1993 Mazda RX-7 FD', price: '$42,000', interest: 'JDM', location: 'Los Angeles, CA' },
    { id: 4, type: 'listing', tag: 'Experts', title: '1969 Mustang Fastback', price: '$55,000', interest: 'Muscle', location: 'Austin, TX' },
    { id: 5, type: 'article', tag: 'Guide', title: 'Restoring E30 Interiors', author: 'BimmerDude', interest: 'Euro', desc: 'How to source OEM fabric.' },
  ];

  // Fallback image
  const getArticleImage = (article) => {
    return article.urlToImage || article.image || article.imageUrl || 
           'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop';
  };

  // ✅ AGGRESSIVE description getter - will ALWAYS return something
  const getArticleDescription = (article) => {
    console.log('Getting description for:', article.title);
    console.log('Article object:', article);
    
    // Try all possible fields
    const desc = article.description || 
                 article.summary || 
                 article.excerpt || 
                 article.content || 
                 article.desc ||
                 article.text ||
                 '';
    
    console.log('Found description:', desc);
    
    if (desc && desc.trim().length > 0) {
      // Clean and return
      return desc
        .replace(/\[.*?\]/g, '') // Remove [+123 chars]
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .trim();
    }
    
    return 'Click to read this automotive news story and stay updated on the latest industry developments.';
  };

  // Truncate
  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="home-container">
      <section className="home-hero-section">
        <div className="hero-overlay"></div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="hero-text-block">
          <span className="welcome-badge">Welcome back, {userName || 'Enthusiast'}</span>
          <h1>Who we are</h1>
          <p className="client-copy">
            We are committed to bring cars and community together. This starts with
            connecting the right people and a space to meet. <strong>Welcome!</strong>
          </p>
          <div className="hero-cta-group">
            <button className="btn-primary-glow" onClick={() => navigate('/marketplace')}>Experts</button>
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
                <button key={tab} className={activeTab === tab ? 'tab-active' : ''} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="home-content-grid">
            <AnimatePresence>
              {feedContent.filter(item => item.interest === activeTab).map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`content-card ${item.type}`}>
                  <span className="content-badge">{item.tag}</span>
                  <h3>{item.title}</h3>
                  {item.type === 'listing'
                    ? <p className="price-text">{item.price}</p>
                    : <p className="desc-text">{item.desc}</p>}
                  <button className="card-action-btn">
                    View {item.type === 'listing' ? 'Listing' : 'Story'} <ChevronRight size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <aside className="home-news-sidebar">
          <div className="news-header">
            <Newspaper size={20} />
            <h3>NYC Car News</h3>
            <TrendingUp size={16} className="trending-icon" />
          </div>

          <div className="news-grid">
            {newsLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="news-card-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-description"></div>
                      <div className="skeleton-description" style={{ width: '80%' }}></div>
                      <div className="skeleton-meta"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : newsError ? (
              <div className="news-error">
                <p>Unable to load news</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : localNews.length === 0 ? (
              <div className="news-empty">
                <Newspaper size={40} />
                <p>No news available</p>
              </div>
            ) : (
              localNews.slice(0, 6).map((article, idx) => {
                const description = getArticleDescription(article);
                const displayDescription = truncateDescription(description);
                
                return (
                  <motion.div
                    key={`${article.url}-${idx}`}
                    className="news-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <div className="news-image-wrapper">
                      <img 
                        src={getArticleImage(article)} 
                        alt={article.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop';
                        }}
                      />
                      <div className="news-overlay">
                        <ExternalLink size={18} />
                      </div>
                    </div>
                    
                    <div className="news-content">
                      <h4>{article.title}</h4>
                      
                      {/* ✅ ALWAYS SHOW DESCRIPTION */}
                      <p className="news-description">
                        {displayDescription}
                      </p>
                      
                      <div className="news-meta">
                        <span className="news-source">
                          {article.source?.name || article.source || 'Source'}
                        </span>
                        <span className="news-divider">•</span>
                        <span className="news-date">
                          <Clock size={12} />
                          {new Date(article.publishedAt || article.date || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <button className="view-all-news" onClick={() => navigate('/news')}>
            Stay Updated
          </button>
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