import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../../styles/Onboarding.css';
import { API_BASE_URL } from '../../config/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);

        const userObject = {
          id: response.data.id || response.data.user?.id,
          username: response.data.username || response.data.user?.username,
          fullName: response.data.fullName || response.data.user?.fullName,
          role: response.data.role || response.data.user?.role || 'user',
          tribes: response.data.tribes || response.data.user?.tribes || []
        };

        localStorage.setItem('user', JSON.stringify(userObject));
        localStorage.setItem('userName', userObject.fullName || userObject.username);
        window.dispatchEvent(new Event("storage"));
        navigate('/');
      }
    } catch (err) {
      console.error('Login Error:', err.response?.data || err.message);
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
              <Mail size={18} className="input-icon" />
              <input
                className="onboard-input"
                type="email"
                placeholder="driver@yctribe.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                className="onboard-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={18} /> : <>{'Enter the Tribe'} <ArrowRight size={18} /></>}
          </button>
        </form>

        <motion.div 
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="footer-text">
            Don't have an account?{' '}
            <Link to="/onboarding" className="footer-link">
              Join the Tribe
            </Link>
          </p>
          <Link to="/forgot-password" id="forgot-pass">
            Forgot password?
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;