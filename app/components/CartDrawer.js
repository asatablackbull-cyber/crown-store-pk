'use client';
import { useCart } from './CartContext';
import { IconBag, IconX } from './Icons';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalPrice } = useCart();

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Your Cart ({items.length})</h3>
          <button className="cart-close" onClick={() => setIsOpen(false)}><IconX width="18" height="18" /></button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon"><IconBag /></div>
              <p>Your cart is empty</p>
              <Link href="/shop" className="btn btn-outline btn-sm" onClick={() => setIsOpen(false)} style={{ marginTop: '1rem' }}>
                Browse Collection
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  {item.size && <div className="cart-item-size">Size: {item.size}</div>}
                  <div className="cart-item-price">Rs. {item.price.toLocaleString()}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.key)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="amount">Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-block" onClick={() => setIsOpen(false)}>
              Checkout — COD
            </Link>
            <Link href="/cart" className="btn btn-outline btn-block" onClick={() => setIsOpen(false)} style={{ marginTop: '0.5rem' }}>
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
