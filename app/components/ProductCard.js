'use client';
import Link from 'next/link';
import { useCart } from './CartContext';
import { IconBag, IconStar } from './Icons';
import { getAverageRating } from '../data/reviews';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const rating = getAverageRating(product.slug);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const firstAvailableSize = product.sizes?.find(s => !product.unavailableSizes?.includes(s)) ?? product.sizes?.[0] ?? '';
    addToCart(product, firstAvailableSize);
  };

  return (
    <div className="product-card" id={`product-${product.slug}`}>
      <Link href={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-image">
          <img
            src={product.images?.[0] || '/images/products/logo.jpg'}
            alt={product.name}
            loading="lazy"
          />
          {discount > 0 && <span className="product-badge">−{discount}%</span>}
          {product.ribbon && <span className="product-ribbon">{product.ribbon}</span>}
          <button
            type="button"
            className="product-card-quick-add"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <IconBag width="15" height="15" />
          </button>
        </div>
        <div className="product-card-info">
          <h3 className="product-card-name">{product.name}</h3>
          {rating && (
            <div className="product-card-rating">
              <IconStar width="11" height="11" />
              <span>{rating.average} ({rating.count})</span>
            </div>
          )}
          <div className="product-card-price">
            <span className="price-current">Rs. {product.price?.toLocaleString()}</span>
            {product.comparePrice > 0 && (
              <span className="price-compare">Rs. {product.comparePrice?.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
