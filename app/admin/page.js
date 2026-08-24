'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Unauthorized');
        return r.json();
      })
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [router]);

  if (loading) return <div className="loading-spinner" style={{ paddingTop: '10rem' }}><div className="spinner" /></div>;
  if (error) return <div className="page-content"><div className="error-message">Access Denied. Please log in as Admin.</div></div>;

  return (
    <div className="admin-layout">
      <AdminSidebar active="dashboard" />

      <main className="admin-content">
        <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '1.5rem' }}>Dashboard Overview</h1>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalOrders || 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">Rs. {(stats?.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.pendingOrders || 0}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalProducts || 0}</div>
            <div className="stat-label">Active Products</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)' }}>Recent Orders</h3>
              <Link href="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
            </div>
            {stats?.recentOrders?.length === 0 ? (
              <p style={{ color: 'var(--color-text-dim)' }}>No orders placed yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>City</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.map(order => (
                      <tr key={order.id}>
                        <td style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{order.orderNumber}</td>
                        <td>{order.customerName}</td>
                        <td>{order.city}</td>
                        <td>Rs. {order.total?.toLocaleString()}</td>
                        <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="stat-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Customer Inquiries</h3>
            {stats?.contacts?.length === 0 ? (
              <p style={{ color: 'var(--color-text-dim)' }}>No messages yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.contacts?.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.subject || 'General'}</td>
                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
