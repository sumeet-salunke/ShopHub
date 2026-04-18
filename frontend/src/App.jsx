import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  const basename = import.meta.env.PROD ? "/ShopHub" : "/";

  return (
    <ToastProvider>
      <AuthProvider>
        <HashRouter basename={basename}>
          <Routes>
            {/* Public routes without layout */}
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Home />} />
              <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
