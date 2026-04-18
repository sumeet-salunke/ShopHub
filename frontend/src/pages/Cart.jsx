import React, { useEffect, useState } from 'react';
import { privateApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FALLBACK_IMAGE, resolveImageUrl } from '../utils/imageUrl';
import './Cart.css';

const getCartItems = (cartData) => {
  const rawItems = cartData?.items || cartData?.formattedItems || [];

  return rawItems
    .map((item) => ({
      _id: item._id || item.productId?._id || item.product?._id,
      productId: item.productId || item.product,
      quantity: Number(item.quantity || 0),
    }))
    .filter((item) => item.productId && item.quantity > 0);
};

export const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await privateApi.get('/auth/cart');
      setCart(data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      const { data } = await privateApi.patch(`/auth/cart/${productId}`, { quantity: newQty });
      setCart(data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await privateApi.delete(`/auth/cart/${productId}`);
      setCart(data.data);
      addToast('Item removed', 'success');
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  const placeOrder = async () => {
    try {
      await privateApi.post('/orders');
      addToast('Order placed successfully! Check email to confirm.', 'success');
      navigate('/orders');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    }
  };

  if (loading) return <div className="loading-container">Loading cart...</div>;

  const validItems = getCartItems(cart);
  const totalAmount = validItems.reduce((acc, item) => acc + (Number(item.productId?.price || 0) * item.quantity), 0);

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Shopping Cart</h2>
      </div>

      {validItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <Button onClick={() => navigate('/')} style={{ width: '200px', marginTop: '20px' }}>Continue Shopping</Button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {validItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={resolveImageUrl(item.productId?.images?.[0])}
                    alt={item.productId?.name || 'Product image'}
                    onError={(event) => {
                      console.warn('Cart image failed to load:', event.currentTarget.src);
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="cart-item-details">
                  <h3>{item.productId?.name || 'Unavailable product'}</h3>
                  <p className="cart-item-price">₹{Number(item.productId?.price || 0).toFixed(2)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.productId?._id, item.quantity, -1)} disabled={!item.productId?._id}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId?._id, item.quantity, 1)} disabled={!item.productId?._id}><Plus size={14} /></button>
                  </div>
                  <p className="cart-item-subtotal">₹{(Number(item.productId?.price || 0) * item.quantity).toFixed(2)}</p>
                  <button className="remove-btn" onClick={() => removeItem(item.productId?._id)} disabled={!item.productId?._id}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <Button onClick={placeOrder} className="checkout-btn">Place Order</Button>
          </div>
        </div>
      )}
    </div>
  );
};
