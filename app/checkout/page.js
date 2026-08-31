'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../components/CartContext';
import { IconCheck, IconCreditCard, IconTag, IconChevronDown } from '../components/Icons';
import Link from 'next/link';

function validateShipping(form) {
  const errors = {};
  if (!form.customerName.trim()) errors.customerName = 'Full name is required.';
  if (!form.phone.trim()) errors.phone = 'Phone number is required.';
  if (!form.address.trim()) errors.address = 'Complete address is required.';
  if (!form.city.trim()) errors.city = 'City is required.';
  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  return errors;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [settings, setSettings] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' }).then(r => r.json()).then(setSettings).catch(() => {});
    fetch('/api/payment-methods', { cache: 'no-store' })
      .then(r => r.json())
      .then(list => {
        setPaymentMethods(list);
        if (list.length === 1) setSelectedMethodId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId) || null;
  const methodFee = selectedMethod ? (parseFloat(selectedMethod.extraFee) || 0) : 0;
  const shippingCharge = parseFloat(settings?.shippingCharge) || 0;
  const discountAmount = coupon?.discountAmount || 0;
  const total = Math.max(0, totalPrice - discountAmount + methodFee + shippingCharge);

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
    setTouched(true);
    const errors = validateShipping(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!selectedMethodId) {
      setError('Please select a payment method to continue.');
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        body: JSON.stringify({ ...form, items, paymentMethodId: selectedMethodId, couponCode: coupon?.code || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderResult({ ...data, paymentMethod: selectedMethod });
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
            Payment Method: <strong>{orderResult.paymentMethod?.name}</strong>
          </p>
          {orderResult.paymentMethod?.type !== 'cod' && orderResult.paymentMethod?.instructions && (
            <div style={{ textAlign: 'left', background: 'var(--color-bg)', border: '1px solid var(--color-border-gold)', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
              {orderResult.paymentMethod.instructions}
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

  const summaryContent = (
    <>
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
        <span>Shipping</span>
        <span style={{ color: shippingCharge > 0 ? 'var(--color-text)' : 'var(--color-success)' }}>{shippingCharge > 0 ? `Rs. ${shippingCharge.toLocaleString()}` : 'FREE'}</span>
      </div>
      {methodFee > 0 && (
        <div className="summary-item">
          <span>{selectedMethod?.name} Charges</span>
          <span>Rs. {methodFee.toLocaleString()}</span>
        </div>
      )}
      <div className="summary-total">
        <span>Total</span>
        <span className="amount">Rs. {total.toLocaleString()}</span>
      </div>
      <div className="cod-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <IconCreditCard width="18" height="18" />
        {selectedMethod ? selectedMethod.name : 'Choose a payment method below'}
      </div>
    </>
  );

  return (
    <>
      <div className="page-header">
        <div className="section-label">Checkout</div>
        <h1>Complete Your Order</h1>
        <p>Fill in your details and choose how you'd like to pay</p>
      </div>

      <button type="button" className="checkout-summary-toggle" onClick={() => setSummaryOpen(o => !o)}>
        <span>
          <IconChevronDown width="16" height="16" className={`checkout-summary-chevron ${summaryOpen ? 'open' : ''}`} />
          Order Summary · {items.reduce((n, i) => n + i.quantity, 0)} item{items.length !== 1 ? 's' : ''}
        </span>
        <span className="checkout-summary-toggle-amount">Rs. {total.toLocaleString()}</span>
      </button>
      <div className={`checkout-summary-collapse ${summaryOpen ? 'open' : ''}`}>
        <div className="checkout-summary-collapse-inner">{summaryContent}</div>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form-section" onSubmit={handleSubmit} noValidate>
          {error && <div className="error-message">{error}</div>}

          <section className="checkout-section">
            <h2>Shipping Information</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="customerName" placeholder="Your full name" value={form.customerName} onChange={handleChange} />
                {touched && fieldErrors.customerName && <div className="field-error">{fieldErrors.customerName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" name="phone" placeholder="03XX-XXXXXXX" value={form.phone} onChange={handleChange} />
                {touched && fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input className="form-input" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} />
              {touched && fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Complete Address *</label>
              <textarea className="form-textarea" name="address" placeholder="House/Street/Area..." value={form.address} onChange={handleChange} style={{ minHeight: '80px' }} />
              {touched && fieldErrors.address && <div className="field-error">{fieldErrors.address}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input className="form-input" name="city" placeholder="Lahore, Karachi, Islamabad..." value={form.city} onChange={handleChange} />
              {touched && fieldErrors.city && <div className="field-error">{fieldErrors.city}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Order Notes (Optional)</label>
              <textarea className="form-textarea" name="notes" placeholder="Any special instructions..." value={form.notes} onChange={handleChange} style={{ minHeight: '60px' }} />
            </div>
          </section>

          <section className="checkout-section" id="payment-section">
            <h2>Payment Method</h2>
            {paymentMethods.length === 0 ? (
              <p style={{ color: 'var(--color-text-dim)' }}>No payment methods are available right now — please contact us to place your order.</p>
            ) : (
              <div className="payment-method-options">
                {paymentMethods.map(m => (
                  <label key={m.id} className={`payment-method-option ${selectedMethodId === m.id ? 'active' : ''}`}>
                    <input type="radio" name="paymentMethodId" checked={selectedMethodId === m.id} onChange={() => setSelectedMethodId(m.id)} />
                    {m.name}
                    {m.extraFee > 0 && <span style={{ color: 'var(--color-text-dim)' }}> (+ Rs. {Number(m.extraFee).toLocaleString()} handling)</span>}
                    {selectedMethodId === m.id && m.instructions && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', whiteSpace: 'pre-wrap', width: '100%' }}>
                        {m.instructions}
                      </p>
                    )}
                  </label>
                ))}
              </div>
            )}
          </section>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting ? 'Placing Order...' : `Place Order — Rs. ${total.toLocaleString()}`}
          </button>
        </form>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {summaryContent}
        </div>
      </div>
    </>
  );
}
