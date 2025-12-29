import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  MessageSquare, 
  ChevronLeft, 
  MapPin, 
  ShieldCheck, 
  X, 
  Send, 
  Gauge, 
  Loader2,
  Info,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ProfileLicense from '../../components/profile/ProfileLicense';
import './ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        // FIX: Ensure the path includes '/listing/' to match your backend router
        const { data } = await axios.get(`http://localhost:5000/api/market/listing/${id}`);
        setCar(data);
        
        // Handle image extraction from both internal Tribe DB and external Dealer API
        const firstImg = data.images?.[0] || data.media?.photo_links?.[0] || "/api/placeholder/800/600";
        setMainImage(firstImg);
      } catch (err) {
        console.error("Listing fetch error:", err);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleSendMessage = () => {
    alert(`Inquiry sent to ${car.seller?.name || car.dealer_name || 'Dealer'}`);
    setIsContactModalOpen(false);
  };

  if (loading) return (
    <div className="market-loader-ui">
      <Loader2 className="spinner" size={40} />
      <p>Retrieving Vehicle Dossier...</p>
    </div>
  );

  if (!car) return (
    <div className="listing-detail-container">
      <div className="error-state card">
        <h1>Vehicle Not Found</h1>
        <p>The requested listing could not be retrieved from the network.</p>
        <button className="btn-primary-contact" onClick={() => navigate('/market')}>
          Return to Marketplace
        </button>
      </div>
    </div>
  );

  // Consolidate photos from different API structures
  const allPhotos = car.images || car.media?.photo_links || [];

  return (
    <div className="listing-detail-container">
      <div className="listing-nav-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Back to Search
        </button>
        <div className="nav-breadcrumbs">
          Marketplace / {car.make} / {car.model}
        </div>
      </div>

      <div className="listing-title-header card">
        <div className="title-left">
          <div className="year-badge">{car.year}</div>
          <h1>{car.make} {car.model}</h1>
          <div className="location-tag">
            <MapPin size={14} /> {car.location || `${car.city}, ${car.state}`}
          </div>
        </div>
        <div className="title-right">
          <div className="header-price-display">
            <span>Asking Price</span>
            <strong>${(car.price || car.msrp)?.toLocaleString() || 'Inquire'}</strong>
          </div>
          <div className="header-stat">
            <Gauge size={16} />
            <span>{car.miles || car.miles_display || 'N/A'} Miles</span>
          </div>
        </div>
      </div>

      <div className="listing-main-grid">
        <div className="listing-visuals">
          <div className="main-image-wrapper card">
            <AnimatePresence mode="wait">
              <motion.img 
                key={mainImage} 
                src={mainImage} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                alt="Main View" 
              />
            </AnimatePresence>
          </div>
          
          <div className="thumbnail-strip">
            {allPhotos.slice(0, 10).map((img, i) => (
              <div 
                key={i} 
                className={`thumb card ${mainImage === img ? 'active-thumb' : ''}`}
                onClick={() => setMainImage(img)}
              >
                <img src={img} alt={`View ${i}`} />
              </div>
            ))}
          </div>

          <div className="details-accordion card">
            <div className="section-header">
              <ShieldCheck size={20} color="#0066ff" />
              <h3>Seller's Description</h3>
            </div>
            <p className="description-text">
              {car.description || "No description provided. Contact seller for details."}
            </p>
          </div>

          <div className="specs-grid-section card">
            <div className="section-header">
              <Zap size={20} color="#0066ff" />
              <h3>Technical Specifications</h3>
            </div>
            <div className="specs-info-grid">
              <div className="spec-item">
                <label>Engine</label>
                <span>{car.specs?.engine || car.engine_description || "N/A"}</span>
              </div>
              <div className="spec-item">
                <label>Transmission</label>
                <span>{car.specs?.transmission || car.transmission_description || "N/A"}</span>
              </div>
              <div className="spec-item">
                <label>VIN</label>
                <span className="vin-text">{car.specs?.vin || car.vin || "Inquire"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="listing-sidebar">
          <div className="sticky-sidebar">
            <h3 className="sidebar-label">Authorized Seller</h3>
            {/* Seller Identity via the ProfileLicense component */}
            <ProfileLicense userData={{
              username: car.seller?.name || car.dealer_name || "Dealer Network",
              personalName: car.seller?.type === "dealer" || car.dealer_name ? "Verified Dealer" : "Verified Member",
              interests: car.seller?.tribes || ["Westchester Network"],
              avatar: car.seller?.avatar || null,
              knowWhats: ["Verified Identity", "Clean Title Status"]
            }} />

            <div className="action-buttons">
              <button className="btn-primary-contact" onClick={() => setIsContactModalOpen(true)}>
                <MessageSquare size={18} /> Contact Seller
              </button>
            </div>

            <div className="trust-signals card">
              <div className="signal">
                <CheckCircle size={16} color="#10b981" />
                <span>Radius Verified (Westchester Area)</span>
              </div>
              <div className="signal">
                <Info size={16} color="#0066ff" />
                <span>Secure In-App Messaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isContactModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="contact-modal card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Inquiry: {car.year} {car.model}</h2>
                <button className="close-modal" onClick={() => setIsContactModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Ask about availability or schedule a viewing..."
                ></textarea>
                <button className="btn-send-message" onClick={handleSendMessage}>
                  <Send size={18} /> Send Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListingDetail;