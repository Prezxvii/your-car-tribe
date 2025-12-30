import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import '../../styles/Onboarding.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Now used correctly below

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);

      if (response.data.token) {
        // 1. Save Session Token
        localStorage.setItem('token', response.data.token);
        
        // 2. Build and save the User Object
        const userObject = {
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
          tribes: response.data.tribes || ['JDM']
        };
        
        localStorage.setItem('user', JSON.stringify(userObject));
        
        // 3. Save backward compatibility fields
        localStorage.setItem('userName', response.data.username);
        localStorage.setItem('userTribes', JSON.stringify(userObject.tribes));
        
        // 4. FIX: Use React Router for navigation instead of window.location.href
        // This clears the 'navigate defined but never used' ESLint error
        navigate('/');
      }
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your garage and the tribe.</p>
        </div>

        {error && (
          <div className="login-error-msg">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="driver@yctribe.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <Loader2 className="spinner" size={18} />
            ) : (
              <>Enter the Tribe <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/onboarding">Join the Tribe</Link></p>
          <Link to="/forgot-password" id="forgot-pass">Forgot password?</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;