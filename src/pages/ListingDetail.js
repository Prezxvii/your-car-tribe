import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Calendar, Gauge } from 'lucide-react';
import './ListingDetail.css';

// SMART URL: Prioritizes .env, then production Render, then localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://your-car-tribe.onrender.com');

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        // Fetches from the synchronized backend route
        const response = await fetch(`${API_BASE_URL}/api/market/listing/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Vehicle not found');
        
        const data = await response.json();
        
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  if (loading) return (
    <div className="listing-loading">
      <Loader2 className="spinner" size={48} />
      <p>Loading vehicle specs...</p>
    </div>
  );

  if (error || !vehicle) return (
    <div className="listing-error-container">
      <div className="error-card card">
        <h2>Vehicle Not Found</h2>
        <p>{error || "The requested listing could not be retrieved."}</p>
        <button onClick={() => navigate('/marketplace')} className="btn-buy">
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
