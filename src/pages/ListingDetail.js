// ============================================
// FIXED: src/pages/marketplace/ListingDetail.js
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Calendar, Gauge } from 'lucide-react';
import './ListingDetail.css';

// --- FIXED: Smart API URL Logic ---
// Priority: 1) .env variable, 2) Production Render URL, 3) Localhost fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('localhost') === false
    ? 'https://your-car-tribe.onrender.com' 
    : 'http://localhost:5000');

console.log('🌐 API_BASE_URL:', API_BASE_URL); // Debug log

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(false);

      try {
        console.log(`🚗 Fetching vehicle: ${id} from ${API_BASE_URL}`);
        
        // Safari-compliant fetch with proper headers
        const response = await fetch(`${API_BASE_URL}/api/market/listing/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'omit', // Important for Safari cross-origin
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          console.error(`❌ Server responded with ${response.status}`);
          throw new Error('Vehicle not found');
        }
        
        const data = await response.json();
        console.log('✅ Vehicle data received:', data);
        setVehicle(data);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  if (loading) return (
    <div className="listing-loading">
      <Loader2 className="spinner" size={48} />
      <p>Loading vehicle specs from the Tribe...</p>
    </div>
  );

  if (error || !vehicle) return (
    <div className="listing-error-container">
      <div className="error-card card">
        <h2>Vehicle Not Found</h2>
        <p>We couldn't retrieve this listing. The vehicle may have been sold or removed.</p>
        <button onClick={() => navigate('/market')} className="btn-buy">
          Return to Marketplace
        </button>
      </div>
    </div>
  );

  return (
    <div className='listing-container'>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back to Results
      </button>

      <h1 className='listing-title'>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h1>

      <div className='listing-grid'>
        {/* Left: Gallery and Description */}
        <div className='main-content'>
          <div className='image-gallery card'>
            <div 
              className='main-image' 
              style={{ 
                backgroundImage: `url(${vehicle.images?.[0] || vehicle.media?.photo_links?.[0] || '/api/placeholder/800/500'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            {(vehicle.images || vehicle.media?.photo_links) && (
              <div className="thumbnail-strip">
                {(vehicle.images || vehicle.media?.photo_links || []).slice(0, 6).map((img, i) => (
                  <div 
                    key={i} 
                    className="thumb" 
                    style={{ backgroundImage: `url(${img})` }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          <div className='description card'>
            <h3>DESCRIPTION</h3>
            <p>{vehicle.description || "No description provided by the seller."}</p>
          </div>
        </div>

        {/* Right: Highlights and Stats */}
        <aside className='sidebar'>
          <div className='highlight-box card'>
            <h4>VEHICLE STATS</h4>
            <ul className="stats-list">
              <li><Calendar size={16} /> <span><b>Year:</b> {vehicle.year}</span></li>
              <li><Gauge size={16} /> <span><b>Mileage:</b> {vehicle.miles?.toLocaleString() || '0'} mi</span></li>
              <li><MapPin size={16} /> <span><b>Location:</b> {vehicle.location || vehicle.city + ', ' + vehicle.state || 'Nationwide'}</span></li>
              <li><ShieldCheck size={16} /> <span><b>VIN:</b> {vehicle.vin || vehicle.specs?.vin || 'Not Provided'}</span></li>
            </ul>
          </div>

          <div className='action-box card'>
            <div className="price-tag">${vehicle.price?.toLocaleString() || vehicle.msrp?.toLocaleString() || 'TBD'}</div>
            <button className='btn-buy' onClick={() => alert('Contact seller feature coming soon!')}>
              CONTACT SELLER
            </button>
            <button className='btn-offer' onClick={() => alert('Make offer feature coming soon!')}>
              MAKE OFFER
            </button>
          </div>

          <div className='seller-info card'>
            <h4>SELLER INFORMATION</h4>
            <p><b>Seller:</b> {vehicle.seller?.name || vehicle.dealer_name || 'Verified Member'}</p>
            <p><b>Type:</b> {vehicle.seller?.type || 'Dealer'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ListingDetail;
