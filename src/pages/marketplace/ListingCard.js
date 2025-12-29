import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Gauge, Heart } from 'lucide-react';

const ListingCard = ({ car }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price) => {
    if (!price || price === 0) return "Inquire for Price";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', currency: 'USD', maximumFractionDigits: 0 
    }).format(price);
  };

  // Helper to format the origin class for CSS (e.g., "Bring a Trailer" -> "bring-a-trailer")
  const getOriginClass = (origin) => {
    return origin ? origin.toLowerCase().replace(/\s+/g, '-') : '';
  };

  return (
    <motion.div
      className="listing-card-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Favorite Button */}
      <motion.button 
        className={`btn-favorite ${isFavorited ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          setIsFavorited(!isFavorited);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.8 }}
      >
        <Heart 
          size={20} 
          fill={isFavorited ? "#ff4757" : "none"} 
          stroke={isFavorited ? "#ff4757" : "white"}
          strokeWidth={2.5}
        />
      </motion.button>

      <Link to={`/listing/${car.id}`} className="listing-card-link">
        <motion.div className="listing-card" whileHover={{ y: -5 }}>
          <div className="card-image-wrapper">
            {/* Source Label (BaT, Cars & Bids, etc) */}
            {car.origin && (
              <span className={`origin-label ${getOriginClass(car.origin)}`}>
                {car.origin}
              </span>
            )}

            {/* No Reserve Badge */}
            {car.isNoReserve && (
              <span className="badge-no-reserve">NO RESERVE</span>
            )}

            <img 
              src={car.imageUrl} 
              alt={`${car.make} ${car.model}`}
              loading="lazy"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
              }}
            />
            
            <span className="tag-category">{car.tag}</span>
            
            {car.distance && (
              <span className="distance-badge">
                {car.distance} miles
              </span>
            )}
          </div>

          <div className="card-content">
            <h3 className="card-title">{car.year} {car.make} {car.model}</h3>
            
            <div className="card-price">
              {formatPrice(car.currentBid || car.price)}
            </div>
            
            <div className="card-footer">
              <div className="footer-item">
                <MapPin size={14} />
                <span className="location-text" title={car.location}>
                  {car.location}
                </span>
              </div>
              <div className="footer-item">
                <Gauge size={14} />
                <span>{car.miles || car.mileage}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ListingCard;