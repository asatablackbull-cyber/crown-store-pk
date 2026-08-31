'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import { IconX } from '../../components/Icons';

function buildInitialForm(product) {
  if (!product) {
    return {
      name: '', slug: '', shortDescription: '', ribbon: '', description: '',
      price: '', comparePrice: '', sku: '', weight: '',
      category: '', sizeList: [], material: '316L Stainless Steel',
      images: [], inStock: true, featured: false
    };
  }
  const unavailable = product.unavailableSizes || [];
  return {
    name: product.name, slug: product.slug, shortDescription: product.shortDescription || '', ribbon: product.ribbon || '',
    description: product.description || '', price: product.price, comparePrice: product.comparePrice || '',
    sku: product.sku || '', weight: product.weight || '',
    category: product.category || '',
    sizeList: (product.sizes || []).map(value => ({ value, available: !unavailable.includes(value) })),
    material: product.material || '316L Stainless Steel',
    images: product.images?.length ? product.images : [], inStock: product.inStock, featured: product.featured
  };
}

export default function ProductForm({ mode, product }) {
  const [form, setForm] = useState(() => buildInitialForm(product));
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        setForm(f => (f.category ? f : { ...f, category: data[0]?.name.toLowerCase() || '' }));
      })
      .catch(() => {});
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setAddingCategory(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(c => [...c, data].sort((a, b) => a.name.localeCompare(b.name)));
        set('category', data.slug);
        setNewCategory('');
      } else {
        setFormError(data.error || 'Failed to add category.');
      }
    } catch {
      setFormError('Network error while adding category.');
    }
    setAddingCategory(false);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError('');
    setUploading(true);
    const token = localStorage.getItem('token');
    const uploaded = [];

    for (const file of files) {
      const body = new FormData();
      body.append('file', file);
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body });
        const data = await res.json();
        if (res.ok) uploaded.push(data.url);
        else setUploadError(data.error || `Failed to upload ${file.name}`);
      } catch {
        setUploadError('Network error while uploading image.');
      }
    }

    if (uploaded.length) setForm(f => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false);
  };

  const handleAddManualUrl = () => {
    const url = manualUrl.trim();
    if (!url) return;
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setManualUrl('');
  };

  const moveImage = (index, direction) => {
    setForm(f => {
      const next = [...f.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return f;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, images: next };
    });
  };

  const removeImage = (index) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  const addSize = () => setForm(f => ({ ...f, sizeList: [...f.sizeList, { value: '', available: true }] }));
  const removeSize = (index) => setForm(f => ({ ...f, sizeList: f.sizeList.filter((_, i) => i !== index) }));
  const updateSizeValue = (index, value) => setForm(f => ({
    ...f, sizeList: f.sizeList.map((s, i) => i === index ? { ...s, value } : s)
  }));
  const toggleSizeAvailable = (index, available) => setForm(f => ({
    ...f, sizeList: f.sizeList.map((s, i) => i === index ? { ...s, available } : s)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const token = localStorage.getItem('token');
    const cleanSizes = form.sizeList.filter(s => s.value.trim());
    const payload = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      images: form.images.length ? form.images : ['/images/products/logo.jpg'],
      sizes: cleanSizes.map(s => s.value.trim()),
      unavailableSizes: cleanSizes.filter(s => !s.available).map(s => s.value.trim()),
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };
    delete payload.sizeList;

    try {
      const res = mode === 'edit'
        ? await fetch(`/api/products/${product.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
          })
        : await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error?.includes('UNIQUE constraint')
          ? 'A product with this name already exists. Please use a different name.'
          : (data.error || 'Failed to save product.'));
        setSaving(false);
        return;
      }

      router.push('/admin/products');
    } catch {
      setFormError('Network error. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar active="products" />

      <main className="admin-content">
        <form onSubmit={handleSubmit} className="product-page">
          <div className="product-page-header">
            <div>
              <Link href="/admin/products" className="admin-back-link">← Back to products</Link>
              <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginTop: '0.5rem' }}>
                {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select className="form-select" style={{ width: 'auto' }} value={form.inStock ? 'active' : 'draft'} onChange={e => set('inStock', e.target.value === 'active')}>
                <option value="active">Active</option>
                <option value="draft">Draft (hidden)</option>
              </select>
              <button type="submit" className="btn btn-primary" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>

          {formError && <div className="error-message">{formError}</div>}

          <div className="product-page-grid">
            <div className="product-page-main">
              <section className="stat-card">
                <h3 className="product-form-section-title">Product</h3>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your product title" required />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Subtitle</label>
                    <input className="form-input" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Your product subtitle" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ribbon</label>
                    <input className="form-input" value={form.ribbon} onChange={e => set('ribbon', e.target.value)} placeholder="e.g. NEW" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" style={{ minHeight: '160px' }} value={form.description} onChange={e => set('description', e.target.value)} />
                </div>
              </section>

              <section className="stat-card">
                <h3 className="product-form-section-title">Images</h3>
                {form.images.length > 0 && (
                  <div className="product-image-list">
                    {form.images.map((src, i) => (
                      <div className="product-image-thumb" key={src + i}>
                        <span className="product-image-number">{i + 1}</span>
                        <img src={src} alt={`Product ${i + 1}`} />
                        <div className="product-image-thumb-actions">
                          <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} title="Move left">‹</button>
                          <button type="button" onClick={() => removeImage(i)} title="Remove">✕</button>
                          <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} title="Move right">›</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Uploading...' : '+ Upload Image(s)'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="form-input" style={{ flex: 1 }} value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="or paste an existing image path" />
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleAddManualUrl}>Add</button>
                </div>
                {uploadError && <div className="error-message" style={{ marginTop: '0.75rem' }}>{uploadError}</div>}
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)', marginTop: '0.75rem' }}>
                  First image is used as the main product photo. Use the arrows to reorder, or ✕ to remove.
                </p>
              </section>

              <section className="stat-card">
                <h3 className="product-form-section-title">Options</h3>
                <div className="form-group">
                  <label className="form-label">Material</label>
                  <input className="form-input" value={form.material} onChange={e => set('material', e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Sizes</label>
                  {form.sizeList.length > 0 && (
                    <div className="size-editor-list">
                      {form.sizeList.map((s, i) => (
                        <div className="size-editor-row" key={i}>
                          <input
                            className="form-input"
                            value={s.value}
                            onChange={e => updateSizeValue(i, e.target.value)}
                            placeholder="e.g. One Size, US 8, 18"
                          />
                          <label className="size-editor-toggle">
                            <input type="checkbox" checked={s.available} onChange={e => toggleSizeAvailable(i, e.target.checked)} />
                            Available
                          </label>
                          <button type="button" className="size-editor-remove" onClick={() => removeSize(i)} aria-label="Remove size">
                            <IconX width="14" height="14" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" className="btn btn-outline btn-sm" onClick={addSize}>+ Add Size</button>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-dim)', marginTop: '0.75rem' }}>
                    Uncheck "Available" to show a size as sold out on the product page — customers will see it crossed out and won't be able to select it.
                  </p>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                  Featured on Home
                </label>
              </section>
            </div>

            <div className="product-page-side">
              <section className="stat-card">
                <h3 className="product-form-section-title">Pricing</h3>
                <div className="form-group">
                  <label className="form-label">Price (PKR) *</label>
                  <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Compare / Discount Price</label>
                  <input className="form-input" type="number" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (g)</label>
                    <input className="form-input" type="number" value={form.weight} onChange={e => set('weight', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="stat-card">
                <h3 className="product-form-section-title">Category</h3>
                <div className="form-group">
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="form-input" style={{ flex: 1 }} value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Add new category" />
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleAddCategory} disabled={addingCategory}>+</button>
                </div>
                <Link href="/admin/categories" style={{ fontSize: '0.78rem', color: 'var(--color-gold)', display: 'inline-block', marginTop: '0.75rem' }}>Manage all categories →</Link>
              </section>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Link href="/admin/products" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
