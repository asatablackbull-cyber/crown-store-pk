'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCrown, IconChart, IconGem, IconPackage, IconGlobe, IconGear, IconTag, IconFolder, IconLogout } from '../../components/Icons';

const NAV_ITEMS = [
  { href: '/admin', key: 'dashboard', label: 'Overview', icon: IconChart },
  { href: '/admin/products', key: 'products', label: 'Products', icon: IconGem },
  { href: '/admin/categories', key: 'categories', label: 'Categories', icon: IconFolder },
  { href: '/admin/orders', key: 'orders', label: 'Orders', icon: IconPackage },
  { href: '/admin/coupons', key: 'coupons', label: 'Coupons', icon: IconTag },
  { href: '/admin/settings', key: 'settings', label: 'Settings', icon: IconGear }
];

export default function AdminSidebar({ active }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.1rem' }}><IconCrown width="20" height="20" /> Admin Portal</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>Crown Store PK</div>
      </div>
      {NAV_ITEMS.map(item => (
        <Link key={item.key} href={item.href} className={active === item.key ? 'active' : ''}>
          <item.icon width="18" height="18" /> {item.label}
        </Link>
      ))}
      <Link href="/" target="_blank"><IconGlobe width="18" height="18" /> View Store</Link>
      <button type="button" onClick={handleLogout} className="admin-sidebar-logout">
        <IconLogout width="18" height="18" /> Logout
      </button>
    </aside>
  );
}
