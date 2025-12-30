import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  ChevronDown,
  Zap,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Car
} from 'lucide-react';
import ListingCard from './ListingCard';
import './Marketplace.css';

// --- DYNAMIC API URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MarketplaceFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zip, setZip] = useState('10523');
  const [radius, setRadius] = useState('25');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);

  const categories = useMemo(
    () => ['All Categories', 'Euro', 'JDM', 'German', 'Muscle', 'Classic'],
    []
  );

  const isValidZip = zip.length === 5;

  const fetchLiveAuctions = useCallback(async () => {
    if (!isValidZip) return;

    setLoading(true);
    try {
      // Use URL constructor with the dynamic API base
      const url = new URL(`${API_BASE_URL}/api/market/all`);
      url.searchParams.set('search', searchQuery);
      url.searchParams.set('zip', zip);
      url.searchParams.set('radius', radius);

      const response = await fetch(url.toString());
      const data = await response.json();

      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, zip, radius, isValidZip]); // Removed API_BASE_URL from deps as it is a constant outside

  useEffect(() => {
    fetchLiveAuctions();
  }, [fetchLiveAuctions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLiveAuctions();
  };

  const filteredCars = listings.filter((car) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || car.tag === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      car.make.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      (car.year && car.year.toString().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      className="marketplace-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HERO SECTION */}
      <section className="market-hero">
        <div className="hero-overlay">
          <motion.div
            className="hero-content"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="hero-badge">
              <Zap size={14} />
              <span>Direct Access: MarketCheck Enthusiast Feed</span>
            </div>

            <h1>Find Your Tribe.</h1>
            <p>The curated marketplace for true automotive enthusiasts.</p>

            <form className="hero-search-container" onSubmit={handleSearchSubmit}>
              <div className="search-main">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Make, model, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="search-location">
                <div className={`location-input ${!isValidZip ? 'invalid' : ''}`}>
                  <MapPin size={18} />
                  <input
                    className="zip-input-field"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="ZIP"
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="radius-select">
                  <Navigation size={18} />
                  <select value={radius} onChange={(e) => setRadius(e.target.value)}>
                    <option value="10">10 mi</option>
                    <option value="25">25 mi</option>
                    <option value="50">50 mi</option>
                    <option value="100">100 mi</option>
                    <option value="250">250 mi</option>
                  </select>
                </div>
              </div>

              <motion.button
                type="submit"
                className="hero-search-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!isValidZip}
              >
                Find My Car
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FEED SECTION */}
      <div className="marketplace-container">
        {loading ? (
          <div className="market-loading-state">
            <Loader2 className="spinner" size={40} />
            <p>Searching enthusiast cars within {radius} miles of {zip}...</p>
          </div>
        ) : (
          <>
            <div className="feed-header">
              <div className="header-text">
                <h2>{searchQuery ? `Results for "${searchQuery}"` : `Cars near ${zip}`}</h2>
                <p>Showing {filteredCars.length} results</p>
              </div>

              <div className="filter-dropdown-container">
                <button
                  className={`filter-btn ${isFilterOpen ? 'active' : ''}`}
                  onClick={() => setIsFilterOpen((v) => !v)}
                >
                  <Filter size={14} />
                  Tribe: {selectedCategory}
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isFilterOpen ? 'rotate(180deg)' : 'none',
                      transition: '0.3s'
                    }}
                  />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      className="filter-menu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          className={`filter-option ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsFilterOpen(false);
                          }}
                        >
                          {cat}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {filteredCars.length > 0 ? (
              <div className="listing-grid">
                {filteredCars.map((car) => (
                  <div key={car.id || car._id} className="card-wrapper-rel">
                    <ListingCard car={car} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results-state">
                <Car size={48} strokeWidth={1} />
                <h3>No cars found</h3>
                <p>Try widening your radius or searching for a different tribe.</p>
                <button 
                  className="btn-outline-blue" 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('All Categories');}}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MarketplaceFeed;