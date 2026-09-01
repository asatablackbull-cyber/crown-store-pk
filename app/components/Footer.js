'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconInstagram, IconFacebook, IconTiktok, IconMessageCircle } from './Icons';
import { normalizeWhatsapp } from '../../lib/whatsapp';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const whatsapp = normalizeWhatsapp(settings?.whatsappNumber);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="navbar-logo" style={{ marginBottom: '0.5rem' }}>
            <img src="/images/products/logo.jpg" alt="Crown Store PK" style={{ height: '50px', width: '50px', borderRadius: '50%', objectFit: 'contain' }} />
            <div className="navbar-logo-text">
              Crown Store<span>Pakistan</span>
            </div>
          </div>
          <p>
            Redefining modern everyday luxury through minimalism, resilience, and uncompromised confidence.
            Marine-grade 316L stainless steel jewelry that is 100% waterproof, sweat-resistant, and tarnish-proof.
          </p>
        </div>

        <div>
          <h4 className="footer-heading">Shop</h4>
          <ul className="footer-links">
            <li><Link href="/shop?category=bracelets">Bracelets</Link></li>
            <li><Link href="/shop?category=rings">Rings</Link></li>
            <li><Link href="/shop?category=sets">Sets</Link></li>
            <li><Link href="/shop">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/about#materials">Our Materials</Link></li>
            <li><Link href="/shipping-policy">Shipping Info</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li><Link href="/orders">Track Order</Link></li>
            <li><Link href="/contact">Customer Support</Link></li>
            <li><Link href="/login">My Account</Link></li>
            <li><Link href="/register">Create Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
            <li><Link href="/return-policy">Return &amp; Refund Policy</Link></li>
            <li><Link href="/shipping-policy">Shipping Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Crown Store PK. All rights reserved.</p>
        <div className="footer-social">
          {settings?.socialInstagram && (
            <a href={settings.socialInstagram} target="_blank" rel="noopener" aria-label="Instagram"><IconInstagram width="17" height="17" /></a>
          )}
          {settings?.socialFacebook && (
            <a href={settings.socialFacebook} target="_blank" rel="noopener" aria-label="Facebook"><IconFacebook width="17" height="17" /></a>
          )}
          {settings?.socialTiktok && (
            <a href={settings.socialTiktok} target="_blank" rel="noopener" aria-label="TikTok"><IconTiktok width="17" height="17" /></a>
          )}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp"><IconMessageCircle width="17" height="17" /></a>
          )}
        </div>
      </div>
    </footer>
  );
}
