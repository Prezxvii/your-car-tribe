import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Calendar, Gauge } from 'lucide-react';
import './ListingDetail.css';

// --- SMART API URL LOGIC ---
// This prioritizes the .env variable you created, then checks if you're on your phone/Safari, 
// and finally defaults to your live Render URL.
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://your-car-tribe.onrender.com');

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
        // Fetching with Safari-compliant headers
        const response = await fetch(`${API_BASE_URL}/api/market/details/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // Include authorization if your marketplace requires login to view details
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          console.error(`Server responded with ${response.status}`);
          throw new Error('Vehicle not found');
        }
        
        const data = await response.json();
        setVehicle(data);
      } catch (err) {
        console.error('Fetch error on Safari/Desktop:', err);
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
        <p>We couldn't retrieve this listing. This usually happens if the link is old or the connection to our server was interrupted.</p>
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
                backgroundImage: `url(${vehicle.image || '/api/placeholder/800/500'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            {vehicle.gallery && vehicle.gallery.length > 0 && (
              <div className="thumbnail-strip">
                {vehicle.gallery.map((img, i) => (
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
              <li><Gauge size={16} /> <span><b>Mileage:</b> {vehicle.mileage?.toLocaleString() || '0'} mi</span></li>
              <li><MapPin size={16} /> <span><b>Location:</b> {vehicle.location || 'Nationwide'}</span></li>
              <li><ShieldCheck size={16} /> <span><b>VIN:</b> {vehicle.vin || 'Not Provided'}</span></li>
            </ul>
          </div>

          <div className='action-box card'>
            <div className="price-tag">${vehicle.price?.toLocaleString() || 'TBD'}</div>
            <button className='btn-buy' onClick={() => alert('Feature coming soon!')}>BUY NOW</button>
            <button className='btn-offer' onClick={() => alert('Feature coming soon!')}>MAKE OFFER</button>
          </div>

          <div className='seller-info card'>
            <h4>SELLER INFORMATION</h4>
            <p><b>Seller:</b> {vehicle.seller_name || 'Verified Member'}</p>
            <p><b>Rating:</b> ⭐⭐⭐⭐⭐ (4.9)</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ListingDetail;