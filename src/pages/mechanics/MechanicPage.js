import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Star, Phone, MapPin, CheckCircle, ExternalLink, 
  ShieldCheck, Search, X, MessageSquare, Clock, Info 
} from 'lucide-react';
import './Mechanic.css';

const MechanicPage = () => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);

  const mechanics = [
    {
      id: 1,
      name: "Precision Euro Works",
      specialty: "German / Euro",
      rating: 4.9,
      reviews: 128,
      location: "Mt Vernon, NY",
      distance: "1.2 mi",
      verified: true,
      phone: "(914) 555-1234",
      about: "Specialize in BMW M-Series and Porsche performance tuning. Factory trained technicians with over 15 years experience.",
      services: ["Engine Tuning", "Diagnostics", "Oil Service", "Brake Upgrades"],
      projects: ["911 GT3 RS Alignment", "M4 Stage 2 Tune"]
    },
    {
      id: 2,
      name: "JDM Performance Hub",
      specialty: "JDM / Japanese",
      rating: 4.8,
      reviews: 95,
      location: "Yonkers, NY",
      distance: "4.5 mi",
      verified: true,
      phone: "(914) 555-5678",
      about: "The go-to spot for forced induction and suspension tuning for Japanese icons. Full track prep available.",
      services: ["Turbo Kits", "Suspension", "Track Prep", "ECU Remapping"],
      projects: ["R34 GTR Single Turbo Conversion", "Supra A90 Widebody"]
    },
    {
      id: 3,
      name: "Westchester Auto Repair",
      specialty: "Domestic",
      rating: 4.7,
      reviews: 102,
      location: "White Plains, NY",
      distance: "3.8 mi",
      verified: true,
      phone: "(914) 555-9012",
      about: "Full-service auto repair for all domestic vehicles. Honest pricing and ASE certified mechanics.",
      services: ["Oil Change", "Brake Service", "Transmission Repair", "Tire Rotation"],
      projects: ["F-150 Brake Overhaul", "Camry Transmission Repair"]
    },
    {
      id: 4,
      name: "Yonkers Import Garage",
      specialty: "European / Euro",
      rating: 4.6,
      reviews: 88,
      location: "Yonkers, NY",
      distance: "2.1 mi",
      verified: true,
      phone: "(914) 555-3456",
      about: "Specializing in high-end European imports. Precision service with state-of-the-art equipment.",
      services: ["Engine Diagnostics", "Suspension", "Alignment", "Performance Tuning"],
      projects: ["Audi RS5 Performance Tune", "Mercedes AMG Suspension Upgrade"]
    },
    {
      id: 5,
      name: "Hudson Valley Auto Works",
      specialty: "Classic",
      rating: 4.9,
      reviews: 67,
      location: "Peekskill, NY",
      distance: "7.5 mi",
      verified: true,
      phone: "(914) 555-7890",
      about: "Classic car restoration and maintenance. Experts in vintage European and American vehicles.",
      services: ["Restoration", "Engine Rebuild", "Paint Work", "Custom Fabrication"],
      projects: ["1967 Mustang Restoration", "1972 BMW 3.0CS Rebuild"]
    },
    {
      id: 6,
      name: "Yonkers Auto Clinic",
      specialty: "Domestic",
      rating: 4.5,
      reviews: 54,
      location: "Yonkers, NY",
      distance: "3.0 mi",
      verified: true,
      phone: "(914) 555-2345",
      about: "Reliable repairs for domestic vehicles. Friendly service and fast turnaround.",
      services: ["Brake Service", "Oil Change", "Battery Replacement", "Tire Service"],
      projects: ["Honda Accord Brake Replacement", "Chevy Silverado Oil Change"]
    },
    {
      id: 7,
      name: "Westchester JDM Garage",
      specialty: "JDM / Japanese",
      rating: 4.8,
      reviews: 77,
      location: "New Rochelle, NY",
      distance: "5.2 mi",
      verified: true,
      phone: "(914) 555-6789",
      about: "Japanese car specialists. Performance upgrades and maintenance for all Japanese imports.",
      services: ["Engine Tuning", "Suspension", "Track Prep", "ECU Remap"],
      projects: ["Nissan 370Z Track Prep", "Mazda RX-7 Turbo Upgrade"]
    },
    {
      id: 8,
      name: "White Plains European Motors",
      specialty: "European / Euro",
      rating: 4.7,
      reviews: 60,
      location: "White Plains, NY",
      distance: "2.5 mi",
      verified: true,
      phone: "(914) 555-4321",
      about: "High-end European car service and repairs. Skilled in both maintenance and performance upgrades.",
      services: ["Diagnostics", "Oil Change", "Brake Service", "Performance Tuning"],
      projects: ["Porsche 911 Alignment", "BMW X5 Brake Upgrade"]
    },
    {
      id: 9,
      name: "Yonkers Classic Auto",
      specialty: "Classic",
      rating: 4.6,
      reviews: 40,
      location: "Yonkers, NY",
      distance: "4.0 mi",
      verified: true,
      phone: "(914) 555-8765",
      about: "Restoring classic cars to their former glory. Experienced with both American and European vintage vehicles.",
      services: ["Restoration", "Engine Rebuild", "Custom Interiors", "Paint Work"],
      projects: ["1969 Camaro Rebuild", "Jaguar E-Type Restoration"]
    },
    {
      id: 10,
      name: "Peekskill Auto Specialists",
      specialty: "Domestic",
      rating: 4.8,
      reviews: 72,
      location: "Peekskill, NY",
      distance: "6.3 mi",
      verified: true,
      phone: "(914) 555-3450",
      about: "Full-service domestic car repair and diagnostics. ASE certified and customer-focused.",
      services: ["Oil Change", "Brakes", "Tires", "Diagnostics"],
      projects: ["Ford Explorer Brake Replacement", "Chevy Malibu Engine Diagnostics"]
    }
  ];

  const filteredMechanics = mechanics.filter(m => {
    const matchesFilter = filter === 'All' || m.specialty === filter;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mechanic-container">
      {/* SHOP DETAIL MODAL */}
      <AnimatePresence>
        {selectedShop && (
          <div className="modal-overlay" onClick={() => setSelectedShop(null)}>
            <motion.div 
              className="shop-modal" 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setSelectedShop(null)}><X size={20}/></button>
              
              <div className="modal-header">
                <div className="verified-badge-large"><ShieldCheck size={16} /> Tribe Verified</div>
                <h2>{selectedShop.name}</h2>
                <span className="specialty-pill">{selectedShop.specialty}</span>
                <a href={`tel:${selectedShop.phone.replace(/\D/g, '')}`} className="modal-phone">
                  <Phone size={16}/> {selectedShop.phone}
                </a>
              </div>

              <div className="modal-grid">
                <div className="modal-main">
                  <h3><Info size={18} className="text-blue" /> About</h3>
                  <p>{selectedShop.about}</p>
                  <h3><Wrench size={18} className="text-blue" /> Recent Projects</h3>
                  <div className="project-tags">
                    {selectedShop.projects.map(p => (
                      <span key={p} className="project-tag"><Wrench size={14}/> {p}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-side">
                  <div className="stat-card">
                    <Clock size={20} className="text-blue" />
                    <div><strong>Turnaround</strong><p>Avg. 3-5 Days</p></div>
                  </div>
                  <button className="btn-contact full-width"><MessageSquare size={18}/> Request Quote</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="page-header">
        <div className="header-badge"><ShieldCheck size={14} /> Verified Experts</div>
        <h1>Local Experts & Mechanics</h1>
        <div className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by shop or service..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="filter-chips">
        {['All', 'German / Euro', 'JDM / Japanese', 'Domestic', 'Classic'].map(type => (
          <button 
            key={type} 
            className={`chip ${filter === type ? 'active' : ''}`}
            onClick={() => { setFilter(type); setSearchQuery(''); }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mechanic-grid">
        <AnimatePresence mode="popLayout">
          {filteredMechanics.length > 0 ? (
            filteredMechanics.map(mechanic => (
              <motion.div 
                key={mechanic.id} 
                layout
                className="mechanic-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mechanic-card-content">
                  <div className="mechanic-info-main">
                    <div className="title-row">
                      <h3>{mechanic.name}</h3>
                      {mechanic.verified && <CheckCircle size={16} className="text-blue" fill="white" />}
                    </div>
                    <span className="specialty-label">{mechanic.specialty}</span>
                    
                    <div className="stats-row">
                      <div className="rating-pill"><Star size={14} fill="#ffcc00" color="#ffcc00" /> {mechanic.rating}</div>
                      <span className="dot-sep">•</span>
                      <span className="location-text"><MapPin size={14} /> {mechanic.location}</span>
                    </div>

                    <div className="service-tags">
                      {mechanic.services.slice(0, 3).map(s => <span key={s} className="s-tag">{s}</span>)}
                    </div>
                  </div>

                  <div className="mechanic-card-actions">
                    <button className="btn-view-profile" onClick={() => setSelectedShop(mechanic)}>View Profile</button>
                    <a href={`tel:${mechanic.phone.replace(/\D/g, '')}`} className="btn-icon-call">
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="no-results">
              <Search size={40} />
              <h3>No mechanics found</h3>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MechanicPage;
