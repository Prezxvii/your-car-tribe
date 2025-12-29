import React from 'react';
import './ListingDetail.css';

const ListingDetail = () => {
  return (
    <div className='listing-container'>
      <h1 className='listing-title'>2006 MINI COOPER S</h1>

      <div className='listing-grid'>
        {/* Left: Gallery and Description */}
        <div className='main-content'>
          <div className='image-gallery card'>
            <div className='main-image'></div>
            <div className="thumbnail-strip">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="thumb"></div>)}
            </div>
          </div>

          <div className='description card'>
            <h3>DESCRIPTION</h3>
            <p>Content goes here...</p>
          </div>
        </div>

        {/* Right: Highlights and Stats */}
        <aside className='sidebar'>
          <div className='highlight-box card'>
            <h4>HIGHLIGHTS</h4>
            <ul>
              <li>Full Serviced</li>
              <li>Low Miles</li>
            </ul>
          </div>

          <div className='action-box card'>
            <button className='btn-buy'>BUY</button>
            <button className='btn-offer'>OFFER</button>
          </div>

          <div className='seller-info card'>
            <h4>SELLER INFORMATION</h4>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ListingDetail;