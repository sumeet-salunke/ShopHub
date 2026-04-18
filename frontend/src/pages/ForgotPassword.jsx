import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      addToast('Reset link sent if the email exists.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to request reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Check Your Email</h2>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your inbox.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input 
            label="Email Address" 
            name="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="john@example.com"
          />
          <Button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="auth-footer">
          Remembered your password? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};
