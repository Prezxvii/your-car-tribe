
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, TrendingUp, Filter, Search, Calendar, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import '../../styles/News.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'electric', 'luxury', 'racing', 'tech', 'industry'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/news/car-news`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        console.log(`✅ Fetched ${data.length} articles`); // Debug log
        setNews(data);
        setFilteredNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter news based on search and category
  useEffect(() => {
    let filtered = news;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter (basic keyword matching)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => {
        const content = `${article.title} ${article.description}`.toLowerCase();
        return content.includes(selectedCategory);
      });
    }

    setFilteredNews(filtered);
  }, [searchQuery, selectedCategory, news]);

  const getArticleImage = (article) => {
    return article.urlToImage || article.image || article.imageUrl || 
           'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop';
  };

  const getArticleDescription = (article) => {
    const desc = article.description || article.summary || article.excerpt || article.content || '';
    
    if (desc && desc.trim().length > 0) {
      return desc
        .replace(/\[.*?\]/g, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    
    return 'Click to read this automotive news story.';
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="news-page">
      {/* Hero Header */}
      <section className="news-hero">
        <div className="news-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-text"
          >
            <div className="hero-badge">
              <Newspaper size={18} />
              <span>LATEST UPDATES</span>
            </div>
            <h1>Automotive News</h1>
            <p>Stay updated with the latest news, trends, and developments in the automotive world</p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="news-controls">
        <div className="controls-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="category-filters">
            <Filter size={18} />
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className="results-count">
            Showing <strong>{filteredNews.length}</strong> of <strong>{news.length}</strong> articles
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="news-content-section">
        <div className="news-container">
          {loading ? (
            // Loading State - 20 skeletons
            <div className="news-grid">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="news-article-skeleton">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-source"></div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-desc"></div>
                    <div className="skeleton-desc"></div>
                    <div className="skeleton-desc short"></div>
                    <div className="skeleton-meta"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="news-error-state">
              <Newspaper size={64} />
              <h3>Unable to load news</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : filteredNews.length === 0 ? (
            // Empty State
            <div className="news-empty-state">
              <Search size={64} />
              <h3>No articles found</h3>
              <p>Try adjusting your search or filter</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            // News Articles Grid - ALL ARTICLES
            <div className="news-grid">
              {filteredNews.map((article, idx) => (
                <motion.article
                  key={`${article.url}-${idx}`}
                  className="news-article-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.6) }} // Faster animation, cap at 0.6s
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <div className="article-image">
                    <img
                      src={getArticleImage(article)}
                      alt={article.title}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop';
                      }}
                    />
                    <div className="article-overlay">
                      <ArrowUpRight size={20} />
                    </div>
                    <div className="article-date-badge">
                      <Clock size={14} />
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>

                  <div className="article-content">
                    <div className="article-source">
                      {article.source?.name || 'News Source'}
                    </div>
                    
                    <h2 className="article-title">
                      {article.title}
                    </h2>
                    
                    <p className="article-description">
                      {truncateText(getArticleDescription(article), 160)}
                    </p>

                    <div className="article-footer">
                      <span className="read-more">
                        Read Full Article →
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Footer */}
      <section className="news-stats">
        <div className="stat-card">
          <Newspaper size={24} />
          <div className="stat-info">
            <span className="stat-number">{news.length}</span>
            <span className="stat-label">Total Articles</span>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div className="stat-info">
            <span className="stat-number">{filteredNews.length}</span>
            <span className="stat-label">Showing Now</span>
          </div>
        </div>
        <div className="stat-card">
          <Calendar size={24} />
          <div className="stat-info">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Live Updates</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;