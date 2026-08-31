'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import { IconX } from '../../components/Icons';

const emptyNewMethod = { name: '', type: 'manual', instructions: '', extraFee: '0' };

export default function AdminDeliveryPage() {
  const [shippingCharge, setShippingCharge] = useState('0');
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newMethod, setNewMethod] = useState(emptyNewMethod);
  const [addingMethod, setAddingMethod] = useState(false);
  const [methodError, setMethodError] = useState('');
  const router = useRouter();

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchAll = () => {
    Promise.all([
      fetch('/api/admin/settings', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/admin/payment-methods', { headers: authHeaders() }).then(r => r.json())
    ]).then(([settings, pm]) => {
      setShippingCharge(settings.shippingCharge ?? '0');
      setMethods(Array.isArray(pm) ? pm : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchAll();
  }, [router]);

  const handleSaveShipping = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ shippingCharge })
      });
      if (res.ok) {
        setMessage('Shipping charge saved successfully.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSaving(false);
  };

  const handleAddMethod = async (e) => {
    e.preventDefault();
    if (!newMethod.name.trim()) return;
    setAddingMethod(true);
    setMethodError('');
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newMethod)
      });
      if (res.ok) {
        setNewMethod(emptyNewMethod);
        fetchAll();
      } else {
        const data = await res.json().catch(() => ({}));
        setMethodError(data.error || 'Failed to add payment method.');
      }
    } catch {
      setMethodError('Network error. Please try again.');
    }
    setAddingMethod(false);
  };

  const updateMethod = async (id, patch) => {
    const res = await fetch(`/api/admin/payment-methods/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(patch)
    });
    if (res.ok) {
      fetchAll();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to update payment method.');
    }
  };

  const deleteMethod = async (id, name) => {
    if (!confirm(`Delete "${name}"? Past orders keep this name on record, but customers won't be able to choose it at checkout anymore.`)) return;
    const res = await fetch(`/api/admin/payment-methods/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      fetchAll();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to delete payment method.');
    }
  };

  if (loading) return <div className="loading-spinner" style={{ paddingTop: '10rem' }}><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <AdminSidebar active="delivery" />

      <main className="admin-content">
        <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '0.5rem' }}>Delivery &amp; Payment</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)', marginBottom: '1.5rem' }}>
          Control what customers pay for shipping, and which payment methods they can choose from at checkout.
        </p>

        <section className="stat-card" style={{ maxWidth: '720px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Shipping Charge</h3>
          <form onSubmit={handleSaveShipping} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: '0 0 200px' }}>
              <label className="form-label">Shipping Charge (Rs.)</label>
              <input className="form-input" type="number" min="0" value={shippingCharge} onChange={e => setShippingCharge(e.target.value)} placeholder="0" />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </form>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginTop: '0.75rem' }}>
            Added to every order regardless of payment method. Leave at 0 to offer free shipping.
          </p>
          {message && <div className="success-message" style={{ marginTop: '1rem' }}>{message}</div>}
          {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
        </section>

        <section className="stat-card" style={{ maxWidth: '720px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Payment Methods</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '1.25rem' }}>
            These are the options customers see at checkout. Add as many as you like — Cash on Delivery, bank transfer, JazzCash, EasyPaisa, and so on.
          </p>

          {methods.length === 0 ? (
            <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>No payment methods yet — add one below.</p>
          ) : (
            <div className="payment-method-list">
              {methods.map(m => (
                <div className="payment-method-row" key={m.id}>
                  <div className="payment-method-row-main">
                    <div className="payment-method-row-name">
                      {m.name}
                      {m.type === 'cod' && <span className="status-badge status-confirmed">COD</span>}
                      {!m.enabled && <span className="status-badge status-cancelled">Disabled</span>}
                    </div>
                    {m.instructions && <div className="payment-method-row-instructions">{m.instructions}</div>}
                    {m.extraFee > 0 && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)' }}>+ Rs. {Number(m.extraFee).toLocaleString()} extra fee</div>
                    )}
                  </div>
                  <div className="payment-method-row-actions">
                    <label className="size-editor-toggle">
                      <input type="checkbox" checked={!!m.enabled} onChange={e => updateMethod(m.id, { enabled: e.target.checked })} />
                      Enabled
                    </label>
                    <button type="button" className="size-editor-remove" onClick={() => deleteMethod(m.id, m.name)} aria-label={`Delete ${m.name}`}>
                      <IconX width="14" height="14" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddMethod} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '1rem' }}>Add a Payment Method</h4>
            {methodError && <div className="error-message" style={{ marginBottom: '1rem' }}>{methodError}</div>}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Method Name</label>
                <input className="form-input" value={newMethod.name} onChange={e => setNewMethod(f => ({ ...f, name: e.target.value }))} placeholder="e.g. JazzCash, EasyPaisa, Bank Transfer" />
              </div>
              <div className="form-group">
                <label className="form-label">Extra Fee (Rs., optional)</label>
                <input className="form-input" type="number" min="0" value={newMethod.extraFee} onChange={e => setNewMethod(f => ({ ...f, extraFee: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Instructions shown to customer (optional)</label>
              <textarea
                className="form-textarea"
                value={newMethod.instructions}
                onChange={e => setNewMethod(f => ({ ...f, instructions: e.target.value }))}
                placeholder="e.g. Account Title: Crown Store PK, IBAN: PK00XXXX... send screenshot on WhatsApp after transfer."
              />
            </div>
            <button type="submit" className="btn btn-outline btn-sm" disabled={addingMethod}>
              {addingMethod ? 'Adding...' : '+ Add Payment Method'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
