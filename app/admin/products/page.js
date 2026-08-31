'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCheck, IconX } from '../../components/Icons';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = () => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [router]);

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/products/${slug}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to delete product.');
      return;
    }
    fetchProducts();
  };

  return (
    <div className="admin-layout">
      <AdminSidebar active="products" />

      <main className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)' }}>Manage Products</h1>
          <Link href="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <>
            <div className="admin-table-view" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <img src={p.images?.[0] || '/images/products/logo.jpg'} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px' }} />
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-white)' }}>{p.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                      <td style={{ color: 'var(--color-gold)' }}>Rs. {p.price?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${p.inStock ? 'status-delivered' : 'status-cancelled'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {p.inStock ? <IconCheck width="12" height="12" /> : <IconX width="12" height="12" />}
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>{p.featured ? <span className="status-badge status-confirmed">Featured</span> : <span style={{ color: 'var(--color-text-dim)' }}>—</span>}</td>
                      <td>
                        <Link href={`/admin/products/${p.slug}`} className="btn btn-secondary btn-sm" style={{ marginRight: '0.5rem' }}>Edit</Link>
                        <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }} onClick={() => handleDelete(p.slug)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-card-list">
              {products.map(p => (
                <div className="admin-card" key={p.id}>
                  <div className="admin-card-media">
                    <img src={p.images?.[0] || '/images/products/logo.jpg'} alt={p.name} />
                  </div>
                  <div className="admin-card-body">
                    <div className="admin-card-title">{p.name}</div>
                    <div className="admin-card-row">
                      <span style={{ textTransform: 'capitalize' }}>{p.category}</span>
                      <span className="admin-card-price">Rs. {p.price?.toLocaleString()}</span>
                    </div>
                    <div className="admin-card-badges">
                      <span className={`status-badge ${p.inStock ? 'status-delivered' : 'status-cancelled'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {p.inStock ? <IconCheck width="12" height="12" /> : <IconX width="12" height="12" />}
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {p.featured && <span className="status-badge status-confirmed">Featured</span>}
                    </div>
                    <div className="admin-card-actions">
                      <Link href={`/admin/products/${p.slug}`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }} onClick={() => handleDelete(p.slug)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
