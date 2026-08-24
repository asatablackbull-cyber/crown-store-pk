'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '../ProductForm';

export default function EditProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    if (!slug) return;
    fetch(`/api/products/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Product not found');
        return r.json();
      })
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setError('Product not found'); setLoading(false); });
  }, [slug, router]);

  if (loading) return <div className="loading-spinner" style={{ paddingTop: '10rem' }}><div className="spinner" /></div>;
  if (error || !product) return <div className="page-content"><div className="error-message">{error || 'Product not found'}</div></div>;

  return <ProductForm mode="edit" product={product} />;
}
