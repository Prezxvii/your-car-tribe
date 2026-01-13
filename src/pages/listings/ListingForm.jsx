import React, { useState } from 'react';
import { Upload, Youtube, Plus, X, Info, Loader2, FileText, Car, MapPin, DollarSign, Gauge, Wrench, Sparkles } from 'lucide-react';
import heic2any from "heic2any";
import axios from 'axios';
import './ListingForm.css';
import { API_BASE_URL } from '../../config/api';

const ListingForm = () => {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [highlights, setHighlights] = useState(['']);

  const [formData, setFormData] = useState({
    year: '', make: '', model: '', price: '', miles: '',
    location: '', description: '', youtubeUrl: '',
    engine: '', transmission: '', drivetrain: '', vin: '',
    titleStatus: 'Clean', tribe: 'OTHER'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateTemplate = () => {
    if (!formData.make || !formData.model) {
      alert("Please enter Year, Make, and Model first.");
      return;
    }
    const template = `This ${formData.year} ${formData.make} ${formData.model} is a prime example of a ${formData.tribe} build.

Technical Overview:
- Title Status: ${formData.titleStatus}
- Transmission: ${formData.transmission || 'N/A'}
- Engine: ${formData.engine || 'N/A'}
- Drivetrain: ${formData.drivetrain || 'N/A'}

Tribe Highlights:
${highlights.filter(h => h.trim() !== '').map(h => `• ${h}`).join('\n')}

Seller Description:
(Explain your build and why you are selling it here...)`;

    setFormData(prev => ({ ...prev, description: template }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
          const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.7 });
          return new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
        }
        return file;
      })
    );
    setSelectedFiles((prev) => [...prev, ...processedFiles]);
    const newPreviews = processedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setLoading(false);
  };

  const removeImage = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addHighlight = () => setHighlights([...highlights, '']);
  const updateHighlight = (index, value) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if(key === 'tribe') data.append('tag', formData[key]);
      else data.append(key, formData[key]);
    });
    data.append('highlights', JSON.stringify(highlights.filter((h) => h.trim() !== '')));
    const specs = { engine: formData.engine, transmission: formData.transmission, drivetrain: formData.drivetrain, vin: formData.vin };
    data.append('specs', JSON.stringify(specs));
    selectedFiles.forEach((file) => data.append('photos', file));

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/market/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert('Success! Submission sent to moderation.');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Server Error'));
    } finally { setLoading(false); }
  };

  return (
    <div className="sell-container">
      <div className="sell-header">
        <h1>Submit Your Vehicle</h1>
        <p>Your listing will be reviewed for quality before appearing in the Expert Feed.</p>
      </div>

      <form className="sell-form" onSubmit={handleSubmit}>
        <section className="form-section card">
          <div className="section-title-box"><Car size={20} color="#0066ff" /><h3>1. Vehicle Basics</h3></div>
          <div className="input-grid">
            <input name="year" type="text" placeholder="Year" onChange={handleInputChange} required />
            <input name="make" type="text" placeholder="Make" onChange={handleInputChange} required />
            <input name="model" type="text" placeholder="Model" onChange={handleInputChange} required />
            
            <select name="titleStatus" className="styled-select" onChange={handleInputChange}>
              <option value="Clean">Clean Title</option>
              <option value="Rebuilt">Rebuilt / Salvage</option>
              <option value="Lien">Lien / Financed</option>
            </select>

            <select name="tribe" className="styled-select" onChange={handleInputChange}>
              <option value="OTHER">Select Tribe Category</option>
              <option value="EURO">Euro</option>
              <option value="JDM">JDM</option>
              <option value="MUSCLE">Muscle</option>
              <option value="4X4">4x4 / Off-Road</option>
              <option value="CLASSIC">Classic</option>
            </select>

            <div className="input-with-icon-small"><Gauge size={16} /><input name="miles" type="text" placeholder="Mileage" onChange={handleInputChange} required /></div>
            <div className="input-with-icon-small"><DollarSign size={16} /><input name="price" type="number" placeholder="Asking Price" onChange={handleInputChange} required /></div>
            <div className="input-with-icon-small"><MapPin size={16} /><input name="location" type="text" placeholder="City, State" onChange={handleInputChange} required /></div>
          </div>
        </section>

        <section className="form-section card">
          <div className="section-title-box"><Upload size={20} color="#0066ff" /><h3>2. Media</h3></div>
          <div className="upload-area">
            <input type="file" id="photo-upload" multiple accept=".heic,.jpg,.jpeg,.png" onChange={handleImageChange} hidden />
            <label htmlFor="photo-upload" className="upload-box">
              <Upload size={32} />
              <p>{loading ? 'Processing...' : 'Upload Photos'}</p>
            </label>
          </div>
          <div className="image-preview-grid">
            {previews.map((url, i) => (
              <div key={i} className="preview-item"><img src={url} alt="p" /><button type="button" onClick={() => removeImage(i)}><X size={12} /></button></div>
            ))}
          </div>
        </section>

        <section className="form-section card">
          <div className="section-title-box"><Wrench size={20} color="#0066ff" /><h3>3. Technical Specs</h3></div>
          <div className="input-grid spec-inputs">
            <input name="engine" type="text" placeholder="Engine" onChange={handleInputChange} />
            <input name="transmission" type="text" placeholder="Transmission (e.g. 6-Speed Manual)" onChange={handleInputChange} />
            <input name="drivetrain" type="text" placeholder="Drivetrain" onChange={handleInputChange} />
            <input name="vin" type="text" placeholder="VIN" onChange={handleInputChange} />
          </div>

          <div className="highlights-header">
            <p className="sub-label">Highlights / Modifications</p>
            <button type="button" className="btn-add" onClick={addHighlight}><Plus size={14} /> Add</button>
          </div>
          <div className="highlights-list">
            {highlights.map((h, i) => (
              <input key={i} type="text" value={h} onChange={(e) => updateHighlight(i, e.target.value)} placeholder="e.g. Coilovers" />
            ))}
          </div>

          <div className="description-toolbar">
            <label className="sub-label">Vehicle Description</label>
            <button type="button" className="btn-template-magic" onClick={generateTemplate}>
              <Sparkles size={14} /> Use Tribe Template
            </button>
          </div>
          <textarea name="description" value={formData.description} className="form-textarea" onChange={handleInputChange} required />
        </section>

        <button type="submit" className="btn-submit" disabled={loading}>{loading ? <Loader2 className="spinner" /> : 'Submit Listing'}</button>
      </form>
    </div>
  );
};

export default ListingForm;
