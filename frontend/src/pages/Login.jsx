import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      const serverError = err.response?.data?.message || 'Login failed';
      setErrors({ server: serverError });
      addToast(serverError, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your ShopHub account.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {errors.server && <div className="form-error-banner">{errors.server}</div>}
          <div className="input-group">
            <Input 
              label="Email Address" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="e.g. john@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="input-group">
            <Input 
              label="Password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="Your password"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <Button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <div className="auth-footer">
          <div style={{ marginBottom: "12px" }}>
            <Link to="/forgot-password" style={{ fontSize: "13px" }}>Forgot your password?</Link>
          </div>
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};