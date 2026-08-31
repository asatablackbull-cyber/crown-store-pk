'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconX } from '../../components/Icons';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Unauthorized');
        return r.json();
      })
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => { router.push('/login'); });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchOrders();
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (selectedOrder && selectedOrder.id === id) setSelectedOrder(null);
    fetchOrders();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar active="orders" />

      <main className="admin-content">
        <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '1.5rem' }}>Manage Orders</h1>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <p style={{ color: 'var(--color-text-dim)' }}>No orders placed yet.</p>
        ) : (
          <>
            <div className="admin-table-view" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{order.orderNumber}</td>
                      <td>{order.customerName}</td>
                      <td>{order.phone}</td>
                      <td>{order.city}</td>
                      <td>Rs. {order.total?.toLocaleString()}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => setSelectedOrder(order)}>Details</button>
                        <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }} onClick={() => handleDelete(order.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-card-list">
              {orders.map(order => (
                <div className="admin-card" key={order.id}>
                  <div className="admin-card-body">
                    <div className="admin-card-row" style={{ marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{order.orderNumber}</span>
                      <span className="admin-card-price">Rs. {order.total?.toLocaleString()}</span>
                    </div>
                    <div className="admin-card-row">
                      <span>{order.customerName} · {order.city}</span>
                    </div>
                    <div className="admin-card-row">
                      <span>{order.phone}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-card-badges">
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="admin-card-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(order)}>Details</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }} onClick={() => handleDelete(order.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedOrder && (
          <div className="cart-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={() => setSelectedOrder(null)}>
            <div className="auth-card" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-heading)' }}>Order #{selectedOrder.orderNumber}</h3>
                <button className="cart-close" onClick={() => setSelectedOrder(null)}><IconX width="18" height="18" /></button>
              </div>

              <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p><strong>Email:</strong> {selectedOrder.email || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedOrder.address}, {selectedOrder.city}</p>
                {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${selectedOrder.status}`}>{selectedOrder.status}</span></p>
              </div>

              <h4 style={{ color: 'var(--color-white)', marginBottom: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>Ordered Items</h4>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                  <span>{item.name} × {item.quantity} {item.size && `(Size: ${item.size})`}</span>
                  <span style={{ color: 'var(--color-gold)' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="summary-total" style={{ marginTop: '1rem' }}>
                <span>Total Amount</span>
                <span className="amount">Rs. {selectedOrder.total?.toLocaleString()}</span>
              </div>

              <button
                className="btn btn-sm"
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)', marginTop: '1.5rem', width: '100%' }}
                onClick={() => handleDelete(selectedOrder.id)}
              >
                Delete Order
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
