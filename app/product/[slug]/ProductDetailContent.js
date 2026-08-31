'use client';
import { useState, useRef } from 'react';
import { useCart } from '../../components/CartContext';
import { IconDroplet, IconShield, IconPackage, IconCreditCard, IconGear, IconSparkles, IconStar, IconCheck } from '../../components/Icons';
import { getProductReviews, getAverageRating } from '../../data/reviews';
import Reveal from '../../components/Reveal';
import Link from 'next/link';

export default function ProductDetailContent({ product }) {
  const firstAvailableSize = product.sizes?.find(s => !product.unavailableSizes?.includes(s)) ?? product.sizes?.[0] ?? '';
  const [selectedSize, setSelectedSize] = useState(firstAvailableSize);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const images = product.images?.length ? product.images : ['/images/products/logo.jpg'];
  const touchStartX = useRef(null);

  const showImage = (i) => setSelectedImage((i + images.length) % images.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    showImage(selectedImage + (delta < 0 ? 1 : -1));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const reviews = getProductReviews(product.slug);
  const ratingSummary = getAverageRating(product.slug);

  return (
    <>
    <div className="product-detail">
      <div className="product-gallery">
        <div
          className="product-main-image"
          onTouchStart={images.length > 1 ? handleTouchStart : undefined}
          onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
        >
          <img src={images[selectedImage] || images[0]} alt={product.name} />
        </div>
        {images.length > 1 && (
          <div className="product-thumbnails">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                className={`product-thumbnail ${i === selectedImage ? 'active' : ''}`}
                onClick={() => showImage(i)}
                onMouseEnter={() => showImage(i)}
                aria-label={`View image ${i + 1} of ${product.name}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h1>{product.name} {product.ribbon && <span className="product-ribbon-inline">{product.ribbon}</span>}</h1>

        {ratingSummary && (
          <a href="#reviews" className="product-rating-summary">
            <span className="testimonial-stars" style={{ marginBottom: 0 }}>
              {Array.from({ length: 5 }).map((_, s) => (
                <IconStar key={s} style={{ opacity: s < Math.round(ratingSummary.average) ? 1 : 0.25 }} />
              ))}
            </span>
            <span>{ratingSummary.average} · {ratingSummary.count} review{ratingSummary.count !== 1 ? 's' : ''}</span>
          </a>
        )}

        <div className="product-price-block">
          <span className="product-price-current">Rs. {product.price?.toLocaleString()}</span>
          {product.comparePrice > 0 && (
            <span className="product-price-compare">Rs. {product.comparePrice?.toLocaleString()}</span>
          )}
          {discount > 0 && (
            <span className="product-save-badge">Save {discount}%</span>
          )}
        </div>

        <p className="product-description">{product.description}</p>

        {product.sizes?.length > 0 && (
          <div className="product-options">
            <div className="product-option-label">Size</div>
            <div className="size-options">
              {product.sizes.map(size => {
                const unavailable = product.unavailableSizes?.includes(size);
                return (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''} ${unavailable ? 'unavailable' : ''}`}
                    onClick={() => !unavailable && setSelectedSize(size)}
                    disabled={unavailable}
                    aria-disabled={unavailable}
                    title={unavailable ? `${size} — out of stock` : size}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', fontSize: '1rem' }}
            >−</button>
            <span style={{ padding: '0.75rem 1.25rem', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', fontSize: '1rem' }}
            >+</button>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1 }}>
            {added ? (<><IconCheck width="16" height="16" /> Added to Cart!</>) : 'Add to Cart'}
          </button>
        </div>

        <Link href="/checkout" className="btn btn-outline btn-block" onClick={handleAddToCart}>
          Buy Now
        </Link>

        <div className="product-features">
          <div className="product-feature">
            <span className="product-feature-icon"><IconDroplet width="20" height="20" /></span>
            <span>100% Waterproof</span>
          </div>
          <div className="product-feature">
            <span className="product-feature-icon"><IconShield width="20" height="20" /></span>
            <span>Tarnish-Proof</span>
          </div>
          <div className="product-feature">
            <span className="product-feature-icon"><IconPackage width="20" height="20" /></span>
            <span>Free Shipping</span>
          </div>
          <div className="product-feature">
            <span className="product-feature-icon"><IconCreditCard width="20" height="20" /></span>
            <span>Flexible Payment</span>
          </div>
          <div className="product-feature">
            <span className="product-feature-icon"><IconGear width="20" height="20" /></span>
            <span>{product.material}</span>
          </div>
          <div className="product-feature">
            <span className="product-feature-icon"><IconSparkles width="20" height="20" /></span>
            <span>Luxury Packaging</span>
          </div>
        </div>
      </div>
    </div>

    {reviews.length > 0 && (
      <section className="section" id="reviews" style={{ maxWidth: '1200px' }}>
        <Reveal className="section-header">
          <div className="section-label">Customer Reviews</div>
          <h2 className="section-title">What Buyers Are Saying</h2>
          <p className="section-subtitle">
            {ratingSummary.average} out of 5 · based on {ratingSummary.count} review{ratingSummary.count !== 1 ? 's' : ''}
          </p>
          <div className="section-divider" />
        </Reveal>
        <div className="testimonials-grid">
          {reviews.map((r, i) => (
            <Reveal as="div" className="testimonial-card" delay={i * 90} key={r.name}>
              <div className="testimonial-stars">
                {Array.from({ length: r.rating }).map((_, s) => (
                  <IconStar key={s} />
                ))}
              </div>
              <p className="testimonial-text">“{r.text}”</p>
              <div className="testimonial-person">
                <div className="testimonial-avatar">{r.initials}</div>
                <div>
                  <div className="testimonial-name">{r.name}</div>
                  <div className="testimonial-location">{r.location}</div>
                  <div className="testimonial-verified"><IconCheck width="12" height="12" /> Verified Purchase</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    )}
    </>
  );
}
