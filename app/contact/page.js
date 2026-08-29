'use client';
import { useState } from 'react';
import { IconMessageCircle, IconMail } from '../components/Icons';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send message.');
      }
    } catch {
      setError('Network error.');
    }
    setSending(false);
  };

  return (
    <>
      <div className="page-header">
        <div className="section-label">Get in Touch</div>
        <h1>Contact Us</h1>
        <p>Have questions? We are here to help.</p>
      </div>
      <div className="page-content" style={{ maxWidth: '800px' }}>
        <div className="form-grid-2" style={{ gap: '3rem', marginBottom: '3rem' }}>
          <div className="feature-card" style={{ textAlign: 'left' }}>
            <div className="feature-icon"><IconMessageCircle /></div>
            <h3 className="feature-title">WhatsApp</h3>
            <p className="feature-text">Chat with us instantly</p>
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>Open WhatsApp</a>
          </div>
          <div className="feature-card" style={{ textAlign: 'left' }}>
            <div className="feature-icon"><IconMail /></div>
            <h3 className="feature-title">Email</h3>
            <p className="feature-text">support@crownstore.pk</p>
            <a href="mailto:support@crownstore.pk" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>Send Email</a>
          </div>
        </div>

        {success && <div className="success-message">Your message has been sent successfully! We&apos;ll get back to you soon.</div>}
        {error && <div className="error-message">{error}</div>}

        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '1.5rem' }}>Send Us a Message</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea className="form-textarea" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </>
  );
}
