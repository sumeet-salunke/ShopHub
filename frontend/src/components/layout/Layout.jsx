import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, LogOut, Trash2, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Layout.css';

export const Navbar = () => {
  const { user, logout, deleteAccount } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account permanently? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete account', 'error');
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">ShopHub</Link>
        
        <div className="nav-links">
          <button onClick={toggleTheme} className="logout-btn" title="Toggle Theme" style={{ marginRight: '10px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {user ? (
            <>
              <div className="nav-item nav-user-greeting" style={{ cursor: 'default' }}>
                <span className="greeting-small" style={{ fontSize: '13px' }}>Hello, <b>{user.name}</b></span>
              </div>
              
              <Link to="/orders" className="nav-item">
                <span className="nav-item-top">Returns</span>
                <span className="nav-item-bottom">& Orders</span>
              </Link>
              
              <Link to="/cart" className="nav-item cart-nav-item">
                <ShoppingCart size={28} />
                <span className="cart-text">Cart</span>
              </Link>

              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>

              <button onClick={handleDeleteAccount} className="logout-btn" title="Delete Account" style={{color: '#ff9900'}}>
                <Trash2 size={18} />
                <span>Delete Account</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item nav-user-greeting">
                <span className="greeting-small">Hello, sign in</span>
                <span className="greeting-large">Account & Lists</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export const Layout = () => {
  return (
    <div className="layout-root">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
