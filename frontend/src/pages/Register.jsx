import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/login');
    } catch (err) {
      const serverError = err.response?.data?.message || 'Registration failed';
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
          <h2>Create an Account</h2>
          <p>Join ShopHub to start shopping.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {errors.server && <div className="form-error-banner">{errors.server}</div>}
          <div className="input-group">
            <Input 
              label="Full Name" 
              name="name" 
              type="text" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. John Doe"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
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
            <span className="helper-text">Use a real email (Gmail recommended) for verification.</span>
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
              placeholder="At least 6 characters"
              className={errors.password ? 'input-error' : ''}
            />
            <span className="helper-text">Password must be at least 6 characters.</span>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <Button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Registering...' : 'Sign Up'}
          </Button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
};
