'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconX } from '../../components/Icons';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { setCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchCategories();
  }, [router]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to add category.');
        setAdding(false);
        return;
      }
      setNewName('');
      fetchCategories();
    } catch {
      setError('Network error. Please try again.');
    }
    setAdding(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? Products already using this category will keep it, but it won't be selectable anymore.`)) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCategories();
  };

  if (loading) return <div className="loading-spinner" style={{ paddingTop: '10rem' }}><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <AdminSidebar active="categories" />

      <main className="admin-content">
        <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '1.5rem' }}>Categories</h1>

        <div className="stat-card" style={{ maxWidth: '480px', marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Add New Category</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem' }}>
            <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Necklaces" />
            <button type="submit" className="btn btn-primary btn-sm" disabled={adding}>{adding ? 'Adding...' : 'Add'}</button>
          </form>
          {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
        </div>

        {categories.length === 0 ? (
          <p style={{ color: 'var(--color-text-dim)' }}>No categories yet.</p>
        ) : (
          <div style={{ overflowX: 'auto', maxWidth: '480px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-white)' }}>{c.name}</td>
                    <td style={{ color: 'var(--color-text-dim)' }}>{c.slug}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Delete category"
                      >
                        <IconX width="16" height="16" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
