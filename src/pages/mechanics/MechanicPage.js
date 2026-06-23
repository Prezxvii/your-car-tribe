import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Star, Phone, MapPin, CheckCircle, Plus,
  ShieldCheck, Search, X, MessageSquare, Clock, Info, Loader2 
} from 'lucide-react';
import axios from 'axios';
import './Mechanic.css';
import { API_BASE_URL } from '../../config/api';

const MechanicPage = () => {
  // State Management
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  
  // Form Submission States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newShop, setNewShop] = useState({
    name: '', specialty: 'German / Euro', location: '', phone: '', about: '', services: '', projects: ''
  });

  // Fetch from Database
  const fetchMechanics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/mechanics/all`);
      setMechanics(data);
    } catch (err) {
      console.error("Error loading directory database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  // Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication token not found. Please log in first.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/mechanics/submit`, newShop, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Shop submitted for community review successfully!");
      setIsFormOpen(false);
      setNewShop({ name: '', specialty: 'German / Euro', location: '', phone: '', about: '', services: '', projects: '' });
      fetchMechanics(); // Reload live list
    } catch (err) {
      alert(err.response?.data?.error || "Error adding shop details.");
    }
  };

  // Internal normalized formatting filter
  const filteredMechanics = mechanics.filter(m => {
    const matchesFilter = filter === 'All' || m.specialty === filter;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.services?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mechanic-container">
      
      {/* SHOP CREATION SUBMISSION MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
            <motion.div 
              className="shop-modal form-adjustments"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>List Local Specialist</h2>
                <button className="close-modal" onClick={() => setIsFormOpen(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleFormSubmit} className="dossier-form-grid">
                <input type="text" placeholder="Shop Name" required value={newShop.name} onChange={e => setNewShop({...newShop, name: e.target.value})} />
                <select value={newShop.specialty} onChange={e => setNewShop({...newShop, specialty: e.target.value})}>
                  <option value="German / Euro">German / Euro</option>
                  <option value="JDM / Japanese">JDM / Japanese</option>
                  <option value="Domestic">Domestic</option>
                  <option value="Classic">Classic</option>
                </select>
                <input type="text" placeholder="Location (City, State)" required value={newShop.location} onChange={e => setNewShop({...newShop, location: e.target.value})} />
                <input type="text" placeholder="Phone Number" required value={newShop.phone} onChange={e => setNewShop({...newShop, phone: e.target.value})} />
                <textarea placeholder="About the shop (experience, tuning focus...)" required value={newShop.about} onChange={e => setNewShop({...newShop, about: e.target.value})} />
                <input type="text" placeholder="Services (comma separated: Engine Tuning, Alignment, Oil Service)" value={newShop.services} onChange={e => setNewShop({...newShop, services: e.target.value})} />
                <input type="text" placeholder="Recent Projects (comma separated: Porsche Stage 2, E46 Rebuild)" value={newShop.projects} onChange={e => setNewShop({...newShop, projects: e.target.value})} />
                <button type="submit" className="btn-contact full-width">Add Shop to Map</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOP DETAIL VIEW MODAL */}
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
                    {selectedShop.projects && selectedShop.projects.length > 0 ? (
                      selectedShop.projects.map(p => (
                        <span key={p} className="project-tag"><Wrench size={14}/> {p}</span>
                      ))
                    ) : <span>No projects recorded yet.</span>}
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
        <div className="header-flex-row">
          <div className="header-badge"><ShieldCheck size={14} /> Verified Experts</div>
          <button className="btn-add-shop" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} /> Add Expert Shop
          </button>
        </div>
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

      {loading ? (
        <div className="market-loader-ui">
          <Loader2 className="spinner" size={40} />
          <p>Scanning Area For Specialists...</p>
        </div>
      ) : (
        <div className="mechanic-grid">
          <AnimatePresence mode="popLayout">
            {filteredMechanics.length > 0 ? (
              filteredMechanics.map(mechanic => (
                <motion.div 
                  key={mechanic._id || mechanic.id} 
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
                        {mechanic.services?.slice(0, 3).map(s => <span key={s} className="s-tag">{s}</span>)}
                      </div>
                    </div>

                    <div className="mechanic-card-actions">
                      <button className="btn-view-profile" onClick={() => setSelectedShop(mechanic)}>View Profile</button>
                      <a href={`tel:${mechanic.phone?.replace(/\D/g, '')}`} className="btn-icon-call">
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
      )}
    </div>
  );
};

export default MechanicPage;