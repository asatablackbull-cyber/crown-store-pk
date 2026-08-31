'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from './CartContext';
import { IconX, IconLogout } from './Icons';
import ThemeToggle from './ThemeToggle';

const DEFAULT_MESSAGES = [
  '✦ FREE SHIPPING ACROSS PAKISTAN',
  '✦ 100% WATERPROOF JEWELRY',
  '✦ FLEXIBLE PAYMENT OPTIONS',
  '✦ TARNISH-PROOF GUARANTEE',
  '✦ PREMIUM LUXURY PACKAGING'
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [user, setUser] = useState(null);
  const { totalItems, setIsOpen } = useCart();
  const topbarRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileOpen(false);
    router.push('/');
  };

  const accountHref = user ? (user.role === 'admin' ? '/admin' : '/orders') : '/login';

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.announcementEnabled === '1' && data.announcementText?.trim()) {
          setAnnouncement(data.announcementText.trim());
        }
      })
      .catch(() => {});
  }, []);

  // Keep the navbar/page offset in sync with the topbar's real height —
  // it changes depending on whether the announcement bar is showing, and
  // can grow further if long announcement text wraps to two lines.
  useEffect(() => {
    const node = topbarRef.current;
    if (!node) return;
    const setHeight = () => {
      document.documentElement.style.setProperty('--topbar-height', `${node.offsetHeight}px`);
    };
    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [announcement]);

  const marqueeItems = [...DEFAULT_MESSAGES, ...DEFAULT_MESSAGES];

  return (
    <>
      <div className="topbar-stack" ref={topbarRef}>
        {announcement && <div className="announcement-bar">{announcement}</div>}
        <div className="marquee-bar">
          <div className="marquee-content">
            {marqueeItems.map((msg, i) => <span key={i}>{msg}</span>)}
          </div>
        </div>
      </div>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <img src="/images/products/logo.jpg" alt="Crown Store PK" />
            <div className="navbar-logo-text">
              Crown Store<span>Pakistan</span>
            </div>
          </Link>

          <ul className="navbar-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>

          <div className="navbar-actions">
            <ThemeToggle className="navbar-theme-toggle" />
            <Link href={accountHref} className="navbar-icon" title={user ? 'My Account' : 'Account'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            {user && (
              <button className="navbar-icon" onClick={handleLogout} title="Logout">
                <IconLogout width="20" height="20" />
              </button>
            )}
            <button className="navbar-icon" onClick={() => setIsOpen(true)} title="Cart" id="cart-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}><IconX width="22" height="22" /></button>
        <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
        <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
        <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
        <Link href={accountHref} onClick={() => setMobileOpen(false)}>{user ? 'My Account' : 'Account'}</Link>
        {user && <button type="button" className="mobile-nav-logout" onClick={handleLogout}>Logout</button>}
        <ThemeToggle className="mobile-nav-theme-toggle" />
      </div>
    </>
  );
}
