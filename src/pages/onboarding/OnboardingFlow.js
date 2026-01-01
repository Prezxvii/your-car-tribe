import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Car, Wrench, Mail, Lock, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Onboarding.css';
import { API_BASE_URL } from '../../config/api';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    bio: '',
    currentCar: '',
    mechanicalExperience: '',
    tribes: []
  });

  const canMoveToStep3 = () => {
    return formData.fullName && formData.username && formData.email && formData.password;
  };

  const canMoveToStep4 = () => {
    return formData.currentCar && formData.mechanicalExperience;
  };

  const nextStep = () => {
    setError('');

    if (step === 2 && !canMoveToStep3()) {
      setError("Please fill out all account details.");
      return;
    }
    if (step === 3 && !canMoveToStep4()) {
      setError("Please tell us about your car and experience.");
      return;
    }
    setStep(step + 1);
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      tribes: prev.tribes.includes(interest)
        ? prev.tribes.filter(i => i !== interest)
        : [...prev.tribes, interest]
    }));
  };

  const handleSignup = async () => {
    if (formData.tribes.length === 0) {
      setError("Select at least one Tribe to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      });

      if (response.status === 201 || response.status === 200) {
        localStorage.setItem('userTribes', JSON.stringify(formData.tribes));
        localStorage.setItem('userName', formData.fullName);
        nextStep();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {error && <div className="error-toast">{error}</div>}

        {step === 1 && (
          <div className="step-content text-center">
            <h1 className="welcome-title">WELCOME</h1>
            <p className="welcome-subtitle">Let's get your enthusiast profile started.</p>
            <button className="btn-setup" onClick={nextStep}>SETUP</button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3 className="step-header">NAME TO A FACE</h3>
            <div className="form-inputs">
              <input
                type="text"
                placeholder="Full Name"
                className="onboard-input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <div className="input-with-icon">
                <AtSign size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  className="onboard-input icon-padding"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  className="onboard-input icon-padding"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  className="onboard-input icon-padding"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button className="btn-next-circle" onClick={nextStep}>
              <ArrowRight size={24} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3 className="step-header">FACTS FOR YOU</h3>
            <div className="input-field">
              <label><Car size={18} /> CURRENT CAR / PROJECT</label>
              <input
                type="text"
                placeholder="e.g. 1992 Nissan 240SX"
                className="onboard-input"
                value={formData.currentCar}
                onChange={(e) => setFormData({ ...formData, currentCar: e.target.value })}
              />
            </div>
            <div className="input-field">
              <label><Wrench size={18} /> MECHANICAL EXPERIENCE</label>
              <input
                type="text"
                placeholder="e.g. DIY Enthusiast"
                className="onboard-input"
                value={formData.mechanicalExperience}
                onChange={(e) => setFormData({ ...formData, mechanicalExperience: e.target.value })}
              />
            </div>
            <button className="btn-next-circle" onClick={nextStep}>
              <ArrowRight size={24} />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h3 className="step-header">THE TRIBES</h3>
            <p className="step-desc">Select at least one tribe to tailor your feed.</p>
            <div className="interests-grid">
              {['JDM', 'Euro', 'Muscle', 'Off-Road', 'Track Days', 'DIY', 'Classics', 'Drifting'].map(tribe => (
                <div
                  key={tribe}
                  className={`interest-tile ${formData.tribes.includes(tribe) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(tribe)}
                >
                  {tribe}
                </div>
              ))}
            </div>
            <button className="btn-continue" onClick={handleSignup} disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "JOIN THE TRIBE"}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="step-content text-center">
            <div className="success-wrapper">
              <CheckCircle size={100} color="#0066ff" />
            </div>
            <h1 className="success-title">YOU'RE ALL SET!</h1>
            <p className="success-desc">Welcome, {formData.fullName}. Your personalized feed is ready.</p>
            <button className="btn-enter" onClick={() => navigate('/')}>ENTER THE TRIBE</button>
          </div>
        )}

        <div className="onboarding-progress">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`progress-dot ${step === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
