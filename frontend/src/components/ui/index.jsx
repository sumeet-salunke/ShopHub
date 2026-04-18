import React from 'react';
import './Components.css';

export const Button = ({ children, outline, className = '', ...props }) => {
  return (
    <button 
      className={`btn ${outline ? 'btn-outline' : 'btn-primary'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input 
        ref={ref}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props} 
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
});
