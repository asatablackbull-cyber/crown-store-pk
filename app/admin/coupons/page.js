'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck, IconX } from '../../components/Icons';
import AdminSidebar from '../components/AdminSidebar';

const emptyForm = { code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', usageLimit: '', expiresAt: '', active: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchCoupons = () => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error('Unauthorized');
        return r.json();
      })
      .then(data => { setCoupons(data); setLoading(false); })
      .catch(() => router.push('/login'));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchCoupons();
  }, [router]);

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || 'Failed to create coupon.');
        setSaving(false);
        return;
      }
      setShowModal(false);
      fetchCoupons();
    } catch {
      setFormError('Network error. Please try again.');
    }
    setSaving(false);
  };

  const toggleActive = async (coupon) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !coupon.active })
    });
    fetchCoupons();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCoupons();
  };

  if (loading) return <div className="loading-spinner" style={{ paddingTop: '10rem' }}><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <AdminSidebar active="coupons" />

      <main className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)' }}>Coupons</h1>
          <button className="btn btn-primary" onClick={handleOpenAdd}>+ Add Coupon</button>
        </div>

        {coupons.length === 0 ? (
          <p style={{ color: 'var(--color-text-dim)' }}>No coupons yet. Create one to offer discounts at checkout.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min. Order</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{c.code}</td>
                    <td>{c.discountType === 'fixed' ? `Rs. ${c.discountValue}` : `${c.discountValue}%`}</td>
                    <td>{c.minOrderAmount > 0 ? `Rs. ${c.minOrderAmount.toLocaleString()}` : '—'}</td>
                    <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                    <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`status-badge ${c.active ? 'status-delivered' : 'status-cancelled'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {c.active ? <IconCheck width="12" height="12" /> : <IconX width="12" height="12" />}
                        {c.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" style={{ marginRight: '0.5rem' }} onClick={() => toggleActive(c)}>
                        {c.active ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }} onClick={() => handleDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="cart-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={() => setShowModal(false)}>
            <div className="auth-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>New Coupon</h2>
              <form onSubmit={handleSubmit}>
                {formError && <div className="error-message">{formError}</div>}
                <div className="form-group">
                  <label className="form-label">Coupon Code *</label>
                  <input className="form-input" style={{ textTransform: 'uppercase' }} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. CROWN20" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select className="form-select" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Value *</label>
                    <input className="form-input" type="number" min="0" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Min. Order Amount</label>
                    <input className="form-input" type="number" min="0" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Usage Limit</label>
                    <input className="form-input" type="number" min="0" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Expires On</label>
                  <input className="form-input" type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving...' : 'Create Coupon'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
