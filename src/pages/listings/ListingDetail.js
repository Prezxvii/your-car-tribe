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
  Zap,
  Star,
  Plus,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ProfileLicense from '../../components/profile/ProfileLicense';
import './ListingDetail.css';
import { API_BASE_URL } from '../../config/api';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Review System State
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/api/market/listing/${id}`,
          { headers: { Accept: 'application/json' } }
        );

        setCar(data);
        setReviews(data.reviews || []); // Initialize with existing reviews from DB
        const firstImg =
          data.images?.[0] ||
          data.media?.photo_links?.[0] ||
          '/api/placeholder/800/600';

        setMainImage(firstImg);
      } catch (err) {
        console.error('Listing fetch error:', err);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  // Submit Review to Backend
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!storedUser) {
      alert("Please sign in to leave a recommendation.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/market/listing/${id}/review`, {
        username: storedUser.username,
        tribe: storedUser.tribe || 'Enthusiast',
        rating: newReview.rating,
        comment: newReview.comment
      });

      // Update local state with fresh data from backend
      setReviews(data.reviews);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (err) {
      console.error("Review submission error:", err);
      alert("Error saving review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSendMessage = () => {
    alert(`Inquiry sent to ${car?.seller?.name || car?.dealer_name || 'Dealer'}`);
    setIsContactModalOpen(false);
  };

  if (loading) {
    return (
      <div className="market-loader-ui">
        <Loader2 className="spinner" size={40} />
        <p>Retrieving Vehicle Dossier...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="listing-detail-container">
        <div className="error-state card">
          <h1>Vehicle Not Found</h1>
          <button className="btn-primary-contact" onClick={() => navigate('/market')}>
            Return to Experts
          </button>
        </div>
      </div>
    );
  }

  const allPhotos = car.images || car.media?.photo_links || [];

  return (
    <div className="listing-detail-container">
      {/* 1. Dossier Navigation */}
      <div className="listing-nav-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Exit Dossier
        </button>
        <div className="nav-breadcrumbs">
          Experts / {car.make} / {car.model}
        </div>
      </div>

      {/* 2. Professional Header */}
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
          {/* Main Stage */}
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

          {/* Thumbnails */}
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

          {/* Technical Spec Sheet */}
          <div className="specs-grid-section card">
            <div className="section-header">
              <Zap size={20} color="#0066ff" />
              <h3>Technical Specifications</h3>
            </div>
            <div className="specs-info-grid">
              <div className="spec-item">
                <label>Engine</label>
                <span>{car.specs?.engine || car.engine_description || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <label>Transmission</label>
                <span className="highlight-spec">{car.specs?.transmission || 'Manual 6-Speed'}</span>
              </div>
              <div className="spec-item">
                <label>Title Status</label>
                <span className="highlight-spec">{car.titleStatus || 'Clean'}</span>
              </div>
              <div className="spec-item">
                <label>VIN</label>
                <span className="vin-text">{car.specs?.vin || car.vin || 'Inquire'}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="details-accordion card">
            <div className="section-header">
              <ShieldCheck size={20} color="#0066ff" />
              <h3>Expert Remarks</h3>
            </div>
            <p className="description-text">
              {car.description || 'No technical remarks provided for this listing.'}
            </p>
          </div>

          {/* NEW FEATURE: Tribe Recommendations System */}
          <div className="recommendations-section card">
            <div className="section-header">
              <div className="header-left">
                <Star size={20} color="#f59e0b" />
                <h3>Community Recommendations</h3>
              </div>
              <button 
                className="btn-add-review" 
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? <X size={16} /> : <Plus size={16} />}
                {showReviewForm ? "Cancel" : "Leave a Recommendation"}
              </button>
            </div>

            <AnimatePresence>
              {showReviewForm && (
                <motion.form 
                  className="review-form-inline"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleReviewSubmit}
                >
                  <div className="rating-input">
                    <label>Tribe Rating:</label>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={18} 
                        fill={s <= newReview.rating ? "#f59e0b" : "none"} 
                        color={s <= newReview.rating ? "#f59e0b" : "#cbd5e1"}
                        onClick={() => setNewReview({...newReview, rating: s})}
                        style={{cursor: 'pointer'}}
                      />
                    ))}
                  </div>
                  <textarea 
                    placeholder="Share your technical observation or vouch for this seller..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    required
                  />
                  <button type="submit" disabled={isSubmittingReview}>
                    {isSubmittingReview ? "Processing..." : "Submit to Dossier"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="rec-grid">
              {reviews.length > 0 ? (
                reviews.map((rec, i) => (
                  <div key={i} className="rec-card">
                    <div className="rec-user">
                      <div className="rec-avatar">{rec.username?.[0] || 'U'}</div>
                      <div className="rec-meta">
                        <strong>{rec.username}</strong>
                        <span>{rec.tribe} Tribe</span>
                      </div>
                      <div className="rec-stars">
                        {[...Array(rec.rating)].map((_, starI) => (
                          <Star key={starI} size={12} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p>"{rec.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="no-reviews">No technical observations recorded for this dossier yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="listing-sidebar">
          <div className="sticky-sidebar">
            <h3 className="sidebar-label">Verified Custodian</h3>

            <ProfileLicense
              userData={{
                username: car.seller?.name || car.dealer_name || 'Dealer Network',
                personalName: car.seller?.type === 'dealer' ? 'Official Partner' : 'Tribe Member',
                interests: [car.tag || 'Enthusiast'],
                avatar: car.seller?.avatar || null,
                knowWhats: ['Identity Verified', 'Title Authenticated'],
              }}
            />

            <div className="action-buttons">
              <button className="btn-primary-contact" onClick={() => setIsContactModalOpen(true)}>
                <MessageSquare size={18} /> Initiate Inquiry
              </button>
            </div>

            <div className="trust-signals card">
              <div className="signal">
                <CheckCircle size={16} color="#10b981" />
                <span>Radius Verified (Local)</span>
              </div>
              <div className="signal">
                <Info size={16} color="#0066ff" />
                <span>Secure Dossier History</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
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
                  placeholder="Ask about availability or technical history..."
                />
                <button className="btn-send-message" onClick={handleSendMessage}>
                  <Send size={18} /> Send Dossier Inquiry
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
