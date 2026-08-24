'use client';
import { useCart } from '../components/CartContext';
import { IconBag, IconCreditCard } from '../components/Icons';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  return (
    <>
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </div>
      <div className="page-content">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', opacity: 0.4, color: 'var(--color-gold)' }}><IconBag width="56" height="56" /></div>
            <h2 style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Your cart is empty</h2>
            <Link href="/shop" className="btn btn-primary">Browse Collection</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem' }}>
            <div>
              {items.map(item => (
                <div key={item.key} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ width: '120px', height: '120px', flexShrink: 0, overflow: 'hidden', background: 'var(--color-bg-card)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-white)', marginBottom: '0.25rem' }}>{item.name}</h3>
                    {item.size && <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>Size: {item.size}</p>}
                    <p style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.1rem', margin: '0.5rem 0' }}>Rs. {item.price.toLocaleString()}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                      <div className="cart-item-qty">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.key)}>Remove</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', color: 'var(--color-white)', fontWeight: 700, fontSize: '1.1rem' }}>
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-item"><span>Subtotal</span><span>Rs. {totalPrice.toLocaleString()}</span></div>
              <div className="summary-item"><span>Shipping</span><span style={{ color: 'var(--color-success)' }}>FREE</span></div>
              <div className="summary-total"><span>Total</span><span className="amount">Rs. {totalPrice.toLocaleString()}</span></div>
              <Link href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>Proceed to Checkout</Link>
              <div className="cod-badge" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IconCreditCard width="18" height="18" /> Cash on Delivery Available</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
