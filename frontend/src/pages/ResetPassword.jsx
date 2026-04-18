import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL search params (e.g., ?token=xyz)
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      addToast('Invalid or missing reset token.', 'error');
    }
  }, [token, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      return addToast('Cannot reset without a valid token.', 'error');
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      addToast('Password reset successfully. You can now login.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create New Password</h2>
          <p>Please enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input 
            label="New Password" 
            name="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            minLength={6}
            placeholder="Min. 6 characters"
          />
          <Button type="submit" disabled={loading || !token} style={{ marginTop: '10px' }}>
            {loading ? 'Resetting...' : 'Confirm Reset'}
          </Button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};
