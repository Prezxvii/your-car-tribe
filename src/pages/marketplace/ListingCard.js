import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Gauge, Heart, ExternalLink, Zap } from 'lucide-react';

const ListingCard = ({ car }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price) => {
    if (!price || price === 0) return "Inquire";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', currency: 'USD', maximumFractionDigits: 0 
    }).format(price);
  };

  const getOriginClass = (origin) => {
    return origin ? origin.toLowerCase().replace(/\s+/g, '-') : '';
  };

  return (
    <motion.div
      className="listing-card-container"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/listing/${car.id || car._id}`} className="listing-card-link">
        <div className="listing-card">
          
          <div className="card-image-wrapper">
            {/* 1. Origin Label (Top Right) */}
            {car.origin && (
              <span className={`origin-label ${getOriginClass(car.origin)}`}>
                {car.origin}
              </span>
            )}

            {/* 2. No Reserve Badge (Top Left) */}
            {car.isNoReserve && (
              <span className="badge-no-reserve">NO RESERVE</span>
            )}

            {/* 3. Favorite Button (Floating) */}
            <button 
              className={`btn-favorite ${isFavorited ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault(); // Stop navigation to detail page
                setIsFavorited(!isFavorited);
              }}
            >
              <Heart 
                size={20} 
                fill={isFavorited ? "#ff4757" : "rgba(0,0,0,0.3)"} 
                stroke={isFavorited ? "#ff4757" : "white"}
                strokeWidth={2.5}
              />
            </button>

            <img 
              src={car.imageUrl || car.image} 
              alt={`${car.make} ${car.model}`}
              loading="lazy"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
              }}
            />
            
            {/* 4. Category Tag & Distance */}
            <div className="card-image-overlay-bottom">
              <span className="tag-category">{car.tag || 'Enthusiast'}</span>
              {car.distance && (
                <span className="distance-badge">
                   <MapPin size={10} /> {Math.round(car.distance)} mi
                </span>
              )}
            </div>
          </div>

          <div className="card-content">
            <h3 className="card-title">{car.year} {car.make} {car.model}</h3>
            
            <div className="card-price">
              {formatPrice(car.currentBid || car.price)}
            </div>
            
            <div className="card-footer">
              <div className="footer-item">
                <Zap size={14} className="blue-icon" />
                <span className="location-text" title={car.location}>
                  {car.location || 'Nationwide'}
                </span>
              </div>
              <div className="footer-item">
                <Gauge size={14} className="blue-icon" />
                <span>{car.miles || car.mileage || 'TMU'}</span>
              </div>
            </div>

            {/* Expert View CTA */}
            <div className="view-listing-link">
              View Expert Details <ExternalLink size={14} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ListingCard;