import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  ChevronDown,
  Zap,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Car,
  X
} from 'lucide-react';
import ListingCard from './ListingCard';
import './Marketplace.css';
import { API_BASE_URL } from '../../config/api';

const MarketplaceFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRadiusOpen, setIsRadiusOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [zip, setZip] = useState('10523');
  const [radius, setRadius] = useState('25');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  
  const radiusRef = useRef(null);
  const filterRef = useRef(null);

  // Categories updated to match the Backend 'tag' field and ListingForm
  const categories = useMemo(
    () => ['All Categories', 'EURO', 'JDM', 'MUSCLE', '4X4', 'CLASSIC'],
    []
  );

  const radiusOptions = ['10', '25', '50', '100', '250', '500'];

  const isValidZip = zip.length === 5;

  const fetchLiveAuctions = useCallback(async () => {
    if (!isValidZip) return;

    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/api/market/all`);
      url.searchParams.set('search', searchQuery);
      url.searchParams.set('zip', zip);
      url.searchParams.set('radius', radius);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        setListings([]);
        return;
      }

      const data = await response.json();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, zip, radius, isValidZip]);

  useEffect(() => {
    fetchLiveAuctions();
  }, [fetchLiveAuctions]);

  // Combined Click Outside Handler for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (radiusRef.current && !radiusRef.current.contains(event.target)) {
        setIsRadiusOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLiveAuctions();
  };

  const filteredCars = listings.filter((car) => {
    // Matches the capitalized tags from the backend
    const matchesCategory =
      selectedCategory === 'All Categories' || car.tag === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      (car.make || '').toLowerCase().includes(query) ||
      (car.model || '').toLowerCase().includes(query) ||
      (car.year && car.year.toString().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div className="marketplace-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HERO SECTION - REBRANDED AS EXPERTS FEED */}
      <section className="market-hero">
        <div className="hero-overlay">
          <motion.div className="hero-content" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="hero-badge">
              <Zap size={14} fill="#0066ff" color="#0066ff" />
              <span>Expert Curated Enthusiast Feed</span>
            </div>

            <h1>Find Your Tribe.</h1>
            <p>Sourcing the best enthusiast builds within the community.</p>

            <form className="hero-search-container" onSubmit={handleSearchSubmit}>
              <div className="search-main">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search Make, Model, or Keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="search-divider" />

              <div className="search-location">
                <div className={`location-input-group ${!isValidZip ? 'invalid' : ''}`}>
                  <MapPin size={18} />
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="ZIP"
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {/* PRETTIER RADIUS DROPDOWN */}
                <div className="custom-select-wrapper" ref={radiusRef}>
                  <button 
                    type="button"
                    className={`radius-trigger ${isRadiusOpen ? 'active' : ''}`} 
                    onClick={() => setIsRadiusOpen(!isRadiusOpen)}
                  >
                    <Navigation size={16} />
                    <span>{radius} mi</span>
                    <ChevronDown size={14} className={isRadiusOpen ? 'rotate' : ''} />
                  </button>
                  
                  <AnimatePresence>
                    {isRadiusOpen && (
                      <motion.div 
                        className="custom-dropdown-menu"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div className="dropdown-header">Search Radius</div>
                        {radiusOptions.map(opt => (
                          <div 
                            key={opt} 
                            className={`dropdown-opt ${radius === opt ? 'selected' : ''}`}
                            onClick={() => { setRadius(opt); setIsRadiusOpen(false); }}
                          >
                            {opt} miles
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button type="submit" className="hero-search-btn" disabled={!isValidZip}>
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FEED SECTION */}
      <div className="marketplace-container">
        {loading ? (
          <div className="market-loading-state">
            <Loader2 className="spinner" size={40} />
            <p>Scanning the Tribe for the best builds...</p>
          </div>
        ) : (
          <>
            <div className="feed-header">
              <div className="header-text">
                <h2>{searchQuery ? `Expert results for "${searchQuery}"` : `Local Tribe Picks (${zip})`}</h2>
                <span className="results-count">{filteredCars.length} Cars Available</span>
              </div>

              {/* TRIBE CATEGORY FILTER */}
              <div className="filter-dropdown-container" ref={filterRef}>
                <button
                  className={`filter-btn-professional ${isFilterOpen ? 'active' : ''}`}
                  onClick={() => setIsFilterOpen((v) => !v)}
                >
                  <Filter size={14} />
                  Tribe: {selectedCategory}
                  <ChevronDown size={14} className={isFilterOpen ? 'rotate' : ''} />
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div className="filter-menu-professional" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          className={`filter-option ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
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
                  <ListingCard key={car.id || car._id} car={car} />
                ))}
              </div>
            ) : (
              <div className="no-results-state">
                <Car size={60} strokeWidth={1} color="#cbd5e1" />
                <h3>No builds found in this area</h3>
                <p>Try expanding your radius or switching your Tribe category.</p>
                <button className="clear-filter-btn" onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); setRadius('100'); }}>
                  Reset Search
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
