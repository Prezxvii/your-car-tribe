import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Calendar, Gauge, AlertCircle } from 'lucide-react';
import './ListingDetail.css';

// --- STRICT URL SELECTION ---
// This prevents Safari from ever attempting to hit http://localhost:5000 
// when the site is running on Vercel.
const getApiUrl = () => {
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://your-car-tribe.onrender.com';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

const API_BASE_URL = getApiUrl();

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isColdStart, setIsColdStart] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      setIsColdStart(false);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for Render wakes

      try {
        console.log(`📡 Tribe API Request: ${API_BASE_URL}/api/market/listing/${id}`);
        
        const coldStartTimer = setTimeout(() => {
          setIsColdStart(true);
        }, 3500);

        const response = await fetch(`${API_BASE_URL}/api/market/listing/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(coldStartTimer);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Vehicle data unavailable (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        setVehicle({
          ...data,
          displayPrice: data.price?.toLocaleString() || data.msrp?.toLocaleString() || 'TBD',
          displayMiles: (data.miles || data.mileage || 0).toLocaleString(),
          displayImage: data.images?.[0] || data.media?.photo_links?.[0] || '/api/placeholder/800/500',
          displayGallery: data.images || data.media?.photo_links || []
        });
      } catch (err) {
        console.error('❌ Tribe API Fetch Failed:', err);
        
        if (err.name === 'AbortError') {
          setError('Server wakeup timed out. Please refresh to try again.');
        } else if (err.message.includes('Failed to fetch')) {
          setError('Network security block. If you are on a restricted network or VPN, please disable it.');
        } else {
          setError(err.message || 'Failed to load vehicle details');
        }
      } finally {
        setLoading(false);
        setIsColdStart(false);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  if (loading) return (
    <div className="listing-loading">
      <Loader2 className="spinner" size={48} />
      <p>Consulting the Tribe archives...</p>
      {isColdStart && (
        <p className="cold-start-msg">
          ⏳ Server is waking up (Render Free Tier), please stay with us...
        </p>
      )}
    </div>
  );

  if (error || !vehicle) return (
    <div className="listing-error-container">
      <div className="error-card card">
        <AlertCircle size={48} className="error-icon" style={{ color: '#ff4444', marginBottom: '16px' }} />
        <h2>Listing Unavailable</h2>
        <p>{error}</p>
        <div className="error-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => window.location.reload()} className="btn-offer">Retry</button>
          <button onClick={() => navigate('/marketplace')} className="btn-buy">Back to Marketplace</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='listing-container'>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back to Results
      </button>

      <h1 className='listing-title'>{vehicle.year} {vehicle.make} {vehicle.model}</h1>

      <div className='listing-grid'>
        <div className='main-content'>
          <div className='image-gallery card'>
            <div 
              className='main-image' 
              style={{ backgroundImage: `url(${vehicle.displayImage})` }}
            ></div>
            <div className="thumbnail-strip">
              {vehicle.displayGallery.slice(0, 6).map((img, i) => (
                <div key={i} className="thumb" style={{ backgroundImage: `url(${img})` }}></div>
              ))}
            </div>
          </div>
          <div className='description card'>
            <h3>DESCRIPTION</h3>
            <p>{vehicle.description || "No description provided."}</p>
          </div>
        </div>

        <aside className='sidebar'>
          <div className='highlight-box card'>
            <h4>VEHICLE STATS</h4>
            <ul className="stats-list">
              <li><Calendar size={16} /> <b>Year:</b> {vehicle.year}</li>
              <li><Gauge size={16} /> <b>Mileage:</b> {vehicle.displayMiles} mi</li>
              <li><MapPin size={16} /> <b>Location:</b> {vehicle.location || 'Nationwide'}</li>
              <li><ShieldCheck size={16} /> <b>VIN:</b> {vehicle.vin || 'Not Listed'}</li>
            </ul>
          </div>
          <div className='action-box card'>
            <div className="price-tag">${vehicle.displayPrice}</div>
            <button className='btn-buy' onClick={() => alert('Contacting seller...')}>CONTACT SELLER</button>
            <button className='btn-offer' onClick={() => alert('Offer functionality coming soon!')}>MAKE OFFER</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ListingDetail;
