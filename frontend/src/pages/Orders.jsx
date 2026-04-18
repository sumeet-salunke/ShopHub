import React, { useEffect, useState } from 'react';
import { privateApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import './Orders.css';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data } = await privateApi.get('/orders');
      setOrders(data.orders || []);
    } catch (err) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await privateApi.patch(`/orders/${orderId}/cancel`);
      addToast('Order cancelled successfully', 'success');
      // Refresh orders
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  if (loading) return <div className="loading-container">Loading orders...</div>;

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = [];
    acc[order.status].push(order);
    return acc;
  }, {});

  const renderOrderGroup = (status, title, groupOrders) => {
    if (!groupOrders || groupOrders.length === 0) return null;
    
    return (
      <div className="order-group" key={status}>
        <h3 className="group-title">{title}</h3>
        <div className="order-list">
          {groupOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-actions">
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  {order.status === 'pending' && (
                    <Button outline onClick={() => handleCancelOrder(order._id)} className="cancel-btn">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span className="order-item-name">{item.quantity}x {item.productName}</span>
                    <span className="order-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <span>Total Amount:</span>
                <span className="order-total">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Your Orders</h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-content">
          {renderOrderGroup('pending', 'Pending Orders', groupedOrders['pending'])}
          {renderOrderGroup('confirmed', 'Confirmed Orders', groupedOrders['confirmed'])}
          {renderOrderGroup('cancelled', 'Cancelled Orders', groupedOrders['cancelled'])}
        </div>
      )}
    </div>
  );
};
