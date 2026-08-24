'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes?.[0] || '');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes?.[0] || '');
    router.push('/checkout');
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
        </div>
        <div className="product-card-info">
          <div className="product-card-category">{product.category}</div>
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-price">
            <span className="price-current">Rs. {product.price?.toLocaleString()}</span>
            {product.comparePrice > 0 && (
              <span className="price-compare">Rs. {product.comparePrice?.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="product-card-actions">
        <button className="btn btn-outline btn-sm" onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
