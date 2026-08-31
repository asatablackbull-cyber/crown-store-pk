'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCrown, IconChart, IconGem, IconPackage, IconGlobe, IconGear, IconTag, IconFolder, IconLogout, IconTruck } from '../../components/Icons';
import ThemeToggle from '../../components/ThemeToggle';

const NAV_ITEMS = [
  { href: '/admin', key: 'dashboard', label: 'Overview', icon: IconChart },
  { href: '/admin/products', key: 'products', label: 'Products', icon: IconGem },
  { href: '/admin/categories', key: 'categories', label: 'Categories', icon: IconFolder },
  { href: '/admin/orders', key: 'orders', label: 'Orders', icon: IconPackage },
  { href: '/admin/coupons', key: 'coupons', label: 'Coupons', icon: IconTag },
  { href: '/admin/delivery', key: 'delivery', label: 'Delivery & Payment', icon: IconTruck },
  { href: '/admin/settings', key: 'settings', label: 'Settings', icon: IconGear }
];

export default function AdminSidebar({ active }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const activeItem = NAV_ITEMS.find(item => item.key === active);

  return (
    <>
      <div className="admin-mobile-bar">
        <div className="admin-mobile-bar-title">
          <IconCrown width="18" height="18" />
          {activeItem ? activeItem.label : 'Admin Portal'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <button
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle admin menu"
            aria-expanded={mobileOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.1rem' }}><IconCrown width="20" height="20" /> Admin Portal</div>
            <ThemeToggle />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Crown Store PK</div>
        </div>
        {NAV_ITEMS.map(item => (
          <Link key={item.key} href={item.href} className={active === item.key ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            <item.icon width="18" height="18" /> {item.label}
          </Link>
        ))}
        <Link href="/" target="_blank" onClick={() => setMobileOpen(false)}><IconGlobe width="18" height="18" /> View Store</Link>
        <button type="button" onClick={handleLogout} className="admin-sidebar-logout">
          <IconLogout width="18" height="18" /> Logout
        </button>
      </aside>

      {mobileOpen && <div className="admin-sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
