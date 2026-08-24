'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNum, setSearchNum] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchedOrder(null);
    if (!searchNum.trim()) return;

    try {
      const res = await fetch(`/api/orders/${searchNum.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setSearchedOrder(data);
      } else {
        setSearchError('Order not found. Please check your order ID.');
      }
    } catch {
      setSearchError('Failed to look up order.');
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="section-label">Support</div>
        <h1>Track Your Order</h1>
        <p>Enter your order ID below or view your order history.</p>
      </div>

      <div className="page-content" style={{ maxWidth: '900px' }}>
        <div className="feature-card" style={{ marginBottom: '3rem', textAlign: 'left' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1rem' }}>Instant Order Tracking</h3>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              className="form-input"
              style={{ flex: 1, minWidth: '240px' }}
              placeholder="e.g. CS-ABC12345"
              value={searchNum}
              onChange={e => setSearchNum(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Track Order</button>
          </form>

          {searchError && <div className="error-message" style={{ marginTop: '1rem' }}>{searchError}</div>}

          {searchedOrder && (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--color-bg)', border: '1px solid var(--color-border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ color: 'var(--color-gold)' }}>Order #{searchedOrder.orderNumber}</h4>
                <span className={`status-badge status-${searchedOrder.status}`}>{searchedOrder.status}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Recipient: <strong>{searchedOrder.customerName}</strong> ({searchedOrder.city})
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Total: <strong>Rs. {searchedOrder.total?.toLocaleString()}</strong> (Cash on Delivery)
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)' }}>
                Date: {new Date(searchedOrder.createdAt).toLocaleDateString()}
              </p>
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-white)', marginBottom: '0.5rem' }}>Items:</div>
                {searchedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0' }}>
                    <span>{item.name} × {item.quantity} {item.size && `(${item.size})`}</span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {orders.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '1.5rem' }}>Your Past Orders</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{order.orderNumber}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>Rs. {order.total?.toLocaleString()}</td>
                      <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
