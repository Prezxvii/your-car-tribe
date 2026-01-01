import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Calendar, Gauge, AlertCircle } from 'lucide-react';
import './ListingDetail.css';

// PRODUCTION API URL - Uses Vercel env var, falls back to deployed Render URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://your-car-tribe.onrender.com');

console.log('🔗 Using API Base URL:', API_BASE_URL);

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

      const startTime = Date.now();

      try {
        console.log(`📡 Fetching from: ${API_BASE_URL}/api/market/listing/${id}`);
        
        // Show cold start message after 3 seconds
        const coldStartTimer = setTimeout(() => {
          setIsColdStart(true);
        }, 3000);

        const response = await fetch(`${API_BASE_URL}/api/market/listing/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(60000) // 60 second timeout for cold starts
        });

        clearTimeout(coldStartTimer);
        const elapsed = Date.now() - startTime;
        console.log(`⏱️ Request took ${elapsed}ms`);

        if (!response.ok) {
          throw new Error(`Vehicle not found (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        console.log('✅ Vehicle data received:', data);
        
        // Normalize data to handle both internal DB and external API structures
        setVehicle({
          ...data,
          displayPrice: data.price?.toLocaleString() || data.msrp?.toLocaleString() || 'TBD',
          displayMiles: (data.miles || data.mileage || 0).toLocaleString(),
          displayImage: data.images?.[0] || data.media?.photo_links?.[0] || '/api/placeholder/800/500',
          displayGallery: data.images || data.media?.photo_links || []
        });
      } catch (err) {
        console.error('❌ Fetch error:', err);
        
        // Provide helpful error messages
        if (err.name === 'AbortError') {
          setError('Request timed out. The server may be waking up, please try again.');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
          setError('Cannot connect to server. Please check your internet connection.');
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
      <p>Loading vehicle specs...</p>
      {isColdStart && (
        <p style={{ marginTop: '10px', color: '#888', fontSize: '14px' }}>
          ⏳ Server is waking up, this may take up to 60 seconds...
        </p>
      )}
    </div>
  );

  if (error || !vehicle) return (
    <div className="listing-error-container">
      <div className="error-card card">
        <AlertCircle size={48} style={{ color: '#ff4444', marginBottom: '16px' }} />
        <h2>Vehicle Not Found</h2>
        <p>{error || "The requested listing could not be retrieved."}</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => window.location.reload()} className="btn-offer">
            Try Again
          </button>
          <button onClick={() => navigate('/marketplace')} className="btn-buy">
            Return to Marketplace
          </button>
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
              <li><ShieldCheck size={16} /> <b>VIN:</b> {vehicle.vin || 'Verified'}</li>
            </ul>
          </div>
          <div className='action-box card'>
            <div className="price-tag">${vehicle.displayPrice}</div>
            <button className='btn-buy'>BUY NOW</button>
            <button className='btn-offer'>MAKE OFFER</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ListingDetail;
