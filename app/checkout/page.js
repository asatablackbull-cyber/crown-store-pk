'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { IconCheck, IconCreditCard, IconTag } from '../components/Icons';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [settings, setSettings] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' }).then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const codFee = paymentMethod === 'cod' ? (parseFloat(settings?.codFee) || 0) : 0;
  const discountAmount = coupon?.discountAmount || 0;
  const total = Math.max(0, totalPrice - discountAmount + codFee);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: totalPrice })
      });
      const data = await res.json();
      if (res.ok) {
        setCoupon(data);
      } else {
        setCoupon(null);
        setCouponError(data.error || 'Invalid coupon code.');
      }
    } catch {
      setCouponError('Network error while checking coupon.');
    }
    setApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.customerName || !form.phone || !form.address || !form.city) {
      setError('Please fill all required fields.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items, paymentMethod, couponCode: coupon?.code || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderResult({ ...data, paymentMethod });
        clearCart();
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  if (orderResult) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div className="success-check" style={{ margin: '0 auto 1.25rem' }}><IconCheck width="30" height="30" /></div>
          <h1 style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>Order Placed!</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Your order <strong style={{ color: 'var(--color-gold)' }}>{orderResult.orderNumber}</strong> has been placed successfully.
          </p>
          {orderResult.discountAmount > 0 && (
            <p style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>
              Coupon applied — you saved Rs. {orderResult.discountAmount.toLocaleString()}!
            </p>
          )}
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            Total: <strong style={{ color: 'var(--color-gold)' }}>Rs. {orderResult.total?.toLocaleString()}</strong>
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Payment Method: <strong>{orderResult.paymentMethod === 'bank_transfer' ? (settings?.onlinePaymentProvider || 'Bank Transfer') : 'Cash on Delivery'}</strong>
          </p>
          {orderResult.paymentMethod === 'bank_transfer' && settings?.onlinePaymentInstructions && (
            <div style={{ textAlign: 'left', background: 'var(--color-bg)', border: '1px solid var(--color-border-gold)', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
              {settings.onlinePaymentInstructions}
            </div>
          )}
          <p style={{ color: 'var(--color-text-dim)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            We will call you to confirm your order. Keep your phone nearby!
          </p>
          <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="section-label">Checkout</div>
        <h1>Complete Your Order</h1>
        <p>Cash on Delivery — Pay when your order arrives</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form-section">
          <h2>Shipping Information</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="customerName" placeholder="Your full name" value={form.customerName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" name="phone" placeholder="03XX-XXXXXXX" value={form.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input className="form-input" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Complete Address *</label>
              <textarea className="form-textarea" name="address" placeholder="House/Street/Area..." value={form.address} onChange={handleChange} required style={{ minHeight: '80px' }} />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input className="form-input" name="city" placeholder="Lahore, Karachi, Islamabad..." value={form.city} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Order Notes (Optional)</label>
              <textarea className="form-textarea" name="notes" placeholder="Any special instructions..." value={form.notes} onChange={handleChange} style={{ minHeight: '60px' }} />
            </div>

            {settings?.onlinePaymentEnabled === '1' && (
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div className="payment-method-options">
                  <label className={`payment-method-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    Cash on Delivery
                  </label>
                  <label className={`payment-method-option ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}>
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                    {settings.onlinePaymentProvider || 'Bank Transfer'}
                  </label>
                </div>
                {paymentMethod === 'bank_transfer' && settings.onlinePaymentInstructions && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    {settings.onlinePaymentInstructions}
                  </p>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? 'Placing Order...' : `Place Order — Rs. ${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {items.map(item => (
            <div key={item.key} className="summary-item">
              <span>{item.name} × {item.quantity} {item.size && `(${item.size})`}</span>
              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}

          <div className="coupon-box">
            {coupon ? (
              <div className="coupon-applied">
                <span><IconTag width="14" height="14" /> {coupon.code} applied</span>
                <button type="button" onClick={removeCoupon}>Remove</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  style={{ flex: 1, padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                />
                <button type="button" className="btn btn-outline btn-sm" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <div style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: '0.5rem' }}>{couponError}</div>}
          </div>

          {discountAmount > 0 && (
            <div className="summary-item">
              <span>Discount ({coupon.code})</span>
              <span style={{ color: 'var(--color-success)' }}>-Rs. {discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-item">
            <span>{codFee > 0 ? 'COD Charges' : 'Shipping'}</span>
            <span style={{ color: codFee > 0 ? 'var(--color-text)' : 'var(--color-success)' }}>{codFee > 0 ? `Rs. ${codFee.toLocaleString()}` : 'FREE'}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span className="amount">Rs. {total.toLocaleString()}</span>
          </div>
          <div className="cod-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconCreditCard width="18" height="18" />
            {paymentMethod === 'bank_transfer' ? `${settings?.onlinePaymentProvider || 'Bank Transfer'} — pay before dispatch` : 'Cash on Delivery — Pay when your order arrives'}
          </div>
        </div>
      </div>
    </>
  );
}
