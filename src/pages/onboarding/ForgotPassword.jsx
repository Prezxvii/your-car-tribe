import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, RotateCcw } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="login-page-container">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div 
            key="request"
            className="login-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>

            <div className="login-header" style={{ marginTop: '20px' }}>
              <div className="login-icon-box">
                <RotateCcw size={30} color="var(--primary-blue)" />
              </div>
              <h2>Reset Password</h2>
              <p>Enter the email associated with your account and we'll send a secure reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input 
                    type="email" 
                    placeholder="driver@yctribe.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"} 
                {!isLoading && <Send size={18} />}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            className="login-card success-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="login-header">
              <div className="success-icon-box">
                <CheckCircle2 size={40} color="#10b981" />
              </div>
              <h2>Check your email</h2>
              <p>We've sent a password reset link to <br/><strong>{email}</strong></p>
            </div>

            <div className="success-actions">
              <button className="btn-login" onClick={() => window.location.href = 'mailto:'}>
                Open Mail App
              </button>
              
              <div className="login-footer">
                <p>Didn't receive the email? <button onClick={() => setIsSubmitted(false)} className="resend-btn">Click to resend</button></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;