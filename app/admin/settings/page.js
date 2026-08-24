'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';

const emptySettings = {
  announcementEnabled: false,
  announcementText: '',
  notificationEmail: '',
  codFee: '0',
  onlinePaymentEnabled: false,
  onlinePaymentProvider: '',
  onlinePaymentInstructions: '',
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: ''
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setForm({
          ...emptySettings,
          ...data,
          announcementEnabled: data.announcementEnabled === '1',
          onlinePaymentEnabled: data.onlinePaymentEnabled === '1',
          smtpSecure: data.smtpSecure === '1'
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const token = localStorage.getItem('token');
    const payload = {
      ...form,
      announcementEnabled: form.announcementEnabled ? '1' : '0',
      onlinePaymentEnabled: form.onlinePaymentEnabled ? '1' : '0',
      smtpSecure: form.smtpSecure ? '1' : '0'
    };
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMessage('Settings saved successfully.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save settings.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setTestResult('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTestResult(res.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
    } catch {
      setTestResult('✗ Network error while sending test email.');
    }
    setTestingEmail(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setChangingPassword(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPasswordMessage('Password updated successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch {
      setPasswordError('Network error. Please try again.');
    }
    setChangingPassword(false);
  };

  if (loading) return <div className="loading-spinner" style={{ paddingTop: '10rem' }}><div className="spinner" /></div>;

  return (
    <div className="admin-layout">
      <AdminSidebar active="settings" />

      <main className="admin-content">
        <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '1.5rem' }}>Store Settings</h1>

        <section className="stat-card" style={{ maxWidth: '720px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Change Admin Password</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '1.25rem' }}>
            If you are still using the default password, change it now before going live.
          </p>
          <form onSubmit={handleChangePassword}>
            {passwordMessage && <div className="success-message">{passwordMessage}</div>}
            {passwordError && <div className="error-message">{passwordError}</div>}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                className="form-input"
                type="password"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  minLength={6}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <section className="stat-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Announcement Bar</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={form.announcementEnabled} onChange={e => set('announcementEnabled', e.target.checked)} />
              Show custom announcement bar (overrides the default rotating messages)
            </label>
            <div className="form-group">
              <label className="form-label">Announcement Text</label>
              <input className="form-input" value={form.announcementText} onChange={e => set('announcementText', e.target.value)} placeholder="e.g. EID SALE — FLAT 20% OFF ALL BRACELETS" />
            </div>
          </section>

          <section className="stat-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Order Notifications</h3>
            <div className="form-group">
              <label className="form-label">Notification Email</label>
              <input className="form-input" type="email" value={form.notificationEmail} onChange={e => set('notificationEmail', e.target.value)} placeholder="you@example.com" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginTop: '-0.5rem' }}>
              This address receives an email every time a new order is placed. Requires the SMTP settings below to be configured.
            </p>
          </section>

          <section className="stat-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Email (SMTP) Configuration</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '1.25rem' }}>
              For Gmail: host smtp.gmail.com, port 587, and use a 16-character{' '}
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener" style={{ color: 'var(--color-gold)' }}>App Password</a>, not your normal password.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">SMTP Host</label>
                <input className="form-input" value={form.smtpHost} onChange={e => set('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Port</label>
                <input className="form-input" value={form.smtpPort} onChange={e => set('smtpPort', e.target.value)} placeholder="587" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Username</label>
              <input className="form-input" value={form.smtpUser} onChange={e => set('smtpUser', e.target.value)} placeholder="you@gmail.com" />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP Password / App Password</label>
              <input className="form-input" type="password" value={form.smtpPass} onChange={e => set('smtpPass', e.target.value)} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label">From Address (optional)</label>
              <input className="form-input" value={form.smtpFrom} onChange={e => set('smtpFrom', e.target.value)} placeholder="Crown Store PK <you@gmail.com>" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={form.smtpSecure} onChange={e => set('smtpSecure', e.target.checked)} />
              Use SSL (port 465 typically)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleTestEmail} disabled={testingEmail}>
                {testingEmail ? 'Sending...' : 'Send Test Email'}
              </button>
              {testResult && <span style={{ fontSize: '0.85rem', color: testResult.startsWith('✓') ? 'var(--color-success)' : 'var(--color-error)' }}>{testResult}</span>}
            </div>
          </section>

          <section className="stat-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Payment Settings</h3>
            <div className="form-group">
              <label className="form-label">Cash on Delivery Charges (Rs.)</label>
              <input className="form-input" type="number" min="0" value={form.codFee} onChange={e => set('codFee', e.target.value)} placeholder="0" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
              Added to every Cash on Delivery order. Leave at 0 for free COD.
            </p>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={form.onlinePaymentEnabled} onChange={e => set('onlinePaymentEnabled', e.target.checked)} />
              Offer an additional online / bank transfer payment option at checkout
            </label>
            {form.onlinePaymentEnabled && (
              <>
                <div className="form-group">
                  <label className="form-label">Provider / Method Name</label>
                  <input className="form-input" value={form.onlinePaymentProvider} onChange={e => set('onlinePaymentProvider', e.target.value)} placeholder="e.g. Bank Transfer, JazzCash, EasyPaisa" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Instructions</label>
                  <textarea className="form-textarea" value={form.onlinePaymentInstructions} onChange={e => set('onlinePaymentInstructions', e.target.value)} placeholder="e.g. Account Title: Crown Store PK, IBAN: PK00XXXX..., send screenshot on WhatsApp after transfer." />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>
                  Note: this shows customers your instructions at checkout for a manual transfer — it does not automatically charge a card.
                  Connecting a live gateway (JazzCash, EasyPaisa, Stripe) needs a merchant account with that provider; once you have API
                  credentials, share them and this can be wired up to process payments automatically.
                </p>
              </>
            )}
          </section>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </main>
    </div>
  );
}
