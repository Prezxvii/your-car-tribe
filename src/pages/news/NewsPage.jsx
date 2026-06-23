import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ArrowUpRight, Award, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import '../../styles/News.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Bring a Trailer', 'Jalopnik', 'Cars & Bids', 'electric', 'ny-local'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/news/car-news`);
        if (!response.ok) throw new Error('Failed to fetch news');
        const data = await response.json();
        setNews(data);
        setFilteredNews(data);
      } catch (_error) {
        console.error('Error fetching news:', _error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = news;

    const strictCarKeywords = ['car', 'auto', 'vehicle', 'motor', 'ev', 'suv', 'truck', 'sedan', 'porsche', 'bmw', 'nissan', 'toyota', 'hypercar', 'supercar', 'auction', 'drive', 'speed', 'wheels', 'horsepower', 'dealership'];
    
    filtered = filtered.filter(article => {
      const title = (article.title || '').toLowerCase();
      const description = (article.description || '').toLowerCase();
      const source = (article.source?.name || '').toLowerCase();

      if (['bring a trailer', 'jalopnik', 'cars & bids', 'car and driver', 'motortrend', 'road & track'].some(src => source.includes(src))) {
        return true;
      }

      const matchCount = strictCarKeywords.reduce((count, word) => {
        return count + (title.includes(word) || description.includes(word) ? 1 : 0);
      }, 0);

      return matchCount >= 2;
    });

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => {
        const content = `${article.title} ${article.description || ''}`.toLowerCase();
        const sourceName = (article.source?.name || '').toLowerCase();
        
        if (selectedCategory === 'ny-local') {
          return content.includes('new york') || content.includes('ny') || content.includes('nyc');
        }
        if (['bring a trailer', 'jalopnik', 'cars & bids'].includes(selectedCategory.toLowerCase())) {
          return sourceName.includes(selectedCategory.toLowerCase());
        }
        return content.includes(selectedCategory.toLowerCase());
      });
    }

    setFilteredNews(filtered);
  }, [searchQuery, selectedCategory, news]);

  const getSourceBadgeClass = (sourceName) => {
    const name = (sourceName || '').toLowerCase();
    if (name.includes('trailer')) return 'badge-bat';
    if (name.includes('jalopnik')) return 'badge-jalopnik';
    if (name.includes('bids')) return 'badge-carsandbids';
    return 'badge-standard';
  };

  const getArticleImage = (article) => {
    return article.urlToImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop';
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(Math.abs(now - date) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours || 1}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="news-page">
      <section className="news-hero">
        <div className="news-hero-content">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-text">
            <div className="hero-badge">
              <Award size={18} />
              <span>LIVE AUTOMOTIVE APIS & AUCTIONS</span>
            </div>
            <h1>Premium Feed</h1>
            <p>Aggregated insight tracking across Bring a Trailer, Jalopnik, Cars & Bids, and regional New York networks</p>
          </motion.div>
        </div>
      </section>

      <section className="news-controls">
        <div className="controls-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Filter premium streams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <Filter size={18} />
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'ny-local' ? 'NY Local' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="news-content-section">
        <div className="news-container">
          {loading ? (
            <div className="loading-placeholder">Loading live streams...</div>
          ) : (
            <div className="news-grid">
              {filteredNews.map((article, idx) => (
                <motion.article
                  key={`${article.url}-${idx}`}
                  className="news-article-card"
                  whileHover={{ y: -5 }}
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <div className="article-image">
                    <img src={getArticleImage(article)} alt={article.title} />
                    <div className="article-date-badge">
                      <Clock size={14} />
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>

                  <div className="article-content">
                    <div className={`article-source-tag ${getSourceBadgeClass(article.source?.name)}`}>
                      {article.source?.name}
                    </div>
                    
                    <h2 className="article-title">{article.title}</h2>
                    <p className="article-description">{truncateText(article.description, 150)}</p>

                    <div className="article-footer">
                      <span className="read-more">View Live Metrics <ArrowUpRight size={14} /></span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPage;