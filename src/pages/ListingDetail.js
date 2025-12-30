import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Calendar, Gauge } from 'lucide-react';
import './ListingDetail.css';

// --- DYNAMIC API URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        // Fetch from your Render backend
        const response = await fetch(`${API_BASE_URL}/api/market/details/${id}`);
        if (!response.ok) throw new Error('Vehicle not found');
        
        const data = await response.json();
        setVehicle(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVehicleDetails();
  }, [id]);

  if (loading) return (
    <div className="listing-loading">
      <Loader2 className="spinner" size={48} />
      <p>Loading vehicle specs...</p>
    </div>
  );

  if (error || !vehicle) return (
    <div className="listing-error-container">
      <h2>Vehicle Not Found</h2>
      <p>The requested listing could not be retrieved from the network.</p>
      <button onClick={() => navigate('/marketplace')} className="btn-buy">
        Return to Marketplace
      </button>
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
              style={{ backgroundImage: `url(${vehicle.image || '/api/placeholder/800/500'})` }}
            ></div>
            <div className="thumbnail-strip">
              {vehicle.gallery?.map((img, i) => (
                <div 
                  key={i} 
                  className="thumb" 
                  style={{ backgroundImage: `url(${img})` }}
                ></div>
              ))}
            </div>
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
              <li><Calendar size={16} /> <b>Year:</b> {vehicle.year}</li>
              <li><Gauge size={16} /> <b>Mileage:</b> {vehicle.mileage?.toLocaleString()} mi</li>
              <li><MapPin size={16} /> <b>Location:</b> {vehicle.location || 'Unavailable'}</li>
              <li><ShieldCheck size={16} /> <b>VIN:</b> {vehicle.vin || 'Verified'}</li>
            </ul>
          </div>

          <div className='action-box card'>
            <div className="price-tag">${vehicle.price?.toLocaleString()}</div>
            <button className='btn-buy'>BUY NOW</button>
            <button className='btn-offer'>MAKE OFFER</button>
          </div>

          <div className='seller-info card'>
            <h4>SELLER INFORMATION</h4>
            <p><b>Dealer:</b> {vehicle.seller_name || 'Private Party'}</p>
            <p><b>Rating:</b> ⭐⭐⭐⭐⭐ (4.9)</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ListingDetail;