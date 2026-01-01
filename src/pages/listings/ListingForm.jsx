import React, { useState } from 'react';
import { Upload, Youtube, Plus, X, Info, Loader2, FileText, Car, MapPin, DollarSign, Gauge, Wrench } from 'lucide-react';
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
    year: '',
    make: '',
    model: '',
    price: '',
    miles: '',
    location: '',
    description: '',
    youtubeUrl: '',
    engine: '',
    transmission: '',
    drivetrain: '',
    vin: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
          try {
            const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.7 });
            return new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
          } catch (err) {
            console.error('HEIC conversion failed:', err);
            return file;
          }
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

  const removeHighlight = (index) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    data.append('highlights', JSON.stringify(highlights.filter((h) => h.trim() !== '')));

    const specs = {
      engine: formData.engine,
      transmission: formData.transmission,
      drivetrain: formData.drivetrain,
      vin: formData.vin
    };
    data.append('specs', JSON.stringify(specs));

    selectedFiles.forEach((file) => data.append('photos', file));

    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_BASE_URL}/api/market/submit`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      alert('Success! Your car is now in the Westchester moderation queue.');
      // optional: reset form / navigate
    } catch (err) {
      alert('Error submitting listing: ' + (err.response?.data?.error || 'Server Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-container">
      <div className="sell-header">
        <h1>Submit Your Vehicle</h1>
        <p>Follow our clean submission process to get your car in front of the tribe.</p>
      </div>

      <form className="sell-form" onSubmit={handleSubmit}>
        <section className="form-section card">
          <div className="section-title-box">
            <Car size={20} color="#0066ff" />
            <h3>1. Vehicle Basics</h3>
          </div>

          <div className="input-grid">
            <input name="year" type="text" placeholder="Year (e.g. 2004)" onChange={handleInputChange} required />
            <input name="make" type="text" placeholder="Make (e.g. BMW)" onChange={handleInputChange} required />
            <input name="model" type="text" placeholder="Model (e.g. M3)" onChange={handleInputChange} required />

            <div className="input-with-icon-small">
              <Gauge size={16} />
              <input name="miles" type="text" placeholder="Mileage" onChange={handleInputChange} required />
            </div>

            <div className="input-with-icon-small">
              <DollarSign size={16} />
              <input name="price" type="number" placeholder="Asking Price" onChange={handleInputChange} required />
            </div>

            <div className="input-with-icon-small">
              <MapPin size={16} />
              <input name="location" type="text" placeholder="City, State" onChange={handleInputChange} required />
            </div>
          </div>
        </section>

        <section className="form-section card">
          <div className="section-title-box">
            <Upload size={20} color="#0066ff" />
            <h3>2. Media & Documentation</h3>
          </div>

          <div className="upload-area">
            <input
              type="file"
              id="photo-upload"
              multiple
              accept=".heic,.jpg,.jpeg,.png"
              onChange={handleImageChange}
              hidden
            />
            <label htmlFor="photo-upload" className="upload-box">
              <Upload size={32} />
              <p>{loading ? 'Processing...' : 'Upload Photos'}</p>
              <span>HEIC & JPEG supported</span>
            </label>

            <div className="upload-box docs">
              <FileText size={32} />
              <p>Technical Documents</p>
              <span>Service records & Dyno sheets</span>
            </div>
          </div>

          <div className="image-preview-grid">
            {previews.map((url, i) => (
              <div key={i} className="preview-item">
                <img src={url} alt="preview" />
                <button type="button" onClick={() => removeImage(i)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="youtube-input">
            <Youtube color="#FF0000" />
            <input
              name="youtubeUrl"
              type="text"
              placeholder="Paste YouTube Video URL (Walkaround/Cold Start)"
              onChange={handleInputChange}
            />
          </div>
        </section>

        <section className="form-section card">
          <div className="section-title-box">
            <Wrench size={20} color="#0066ff" />
            <h3>3. Technical & Specs</h3>
            <div className="tooltip">
              <Info size={14} /> <span>Detailed specs help buyers decide faster.</span>
            </div>
          </div>

          <div className="input-grid spec-inputs">
            <input name="engine" type="text" placeholder="Engine (e.g. S54 3.2L I6)" onChange={handleInputChange} />
            <input name="transmission" type="text" placeholder="Transmission (e.g. 6-Speed Manual)" onChange={handleInputChange} />
            <input name="drivetrain" type="text" placeholder="Drivetrain (e.g. RWD)" onChange={handleInputChange} />
            <input name="vin" type="text" placeholder="VIN Number" onChange={handleInputChange} />
          </div>

          <p className="sub-label">Highlights (Modifications, recent service, rare options)</p>

          <div className="highlights-list">
            {highlights.map((h, index) => (
              <div key={index} className="highlight-item">
                <input
                  type="text"
                  placeholder="e.g. Subframe reinforced with Turner plates"
                  value={h}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                />
                {highlights.length > 1 && (
                  <button type="button" onClick={() => removeHighlight(index)}>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="btn-add" onClick={addHighlight}>
              <Plus size={14} /> Add Another Highlight
            </button>
          </div>

          <textarea
            name="description"
            placeholder="Detailed Vehicle Description..."
            className="form-textarea"
            onChange={handleInputChange}
            required
          />
        </section>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <Loader2 className="spinner" /> : 'Submit to Moderation'}
          </button>
          <p className="disclaimer">Your submission will be reviewed by the Westchester Tribe for quality.</p>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
