'use client';
import { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';

export default function ShopContent({ initialCategory, initialCategories, initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');
  const categories = [{ key: 'all', label: 'All' }, ...initialCategories.map(c => ({ key: c.slug, label: c.name }))];
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const url = activeCategory === 'all' ? '/api/products' : `/api/products?category=${activeCategory}`;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  return (
    <>
      <div className="page-header">
        <div className="section-label">Collection</div>
        <h1>Shop All Jewelry</h1>
        <p>Every piece is 100% waterproof, tarnish-proof, and crafted to last a lifetime.</p>
      </div>

      <div className="page-content">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`btn btn-sm ${activeCategory === cat.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-dim)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No products found in this category.</p>
            <button className="btn btn-outline" onClick={() => setActiveCategory('all')}>View All Products</button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 8) * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
