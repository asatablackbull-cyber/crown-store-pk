'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import { IconMessageCircle } from './Icons';
import { normalizeWhatsapp } from '../../lib/whatsapp';

export default function StoreChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (isAdmin) return;
    fetch('/api/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setWhatsapp(normalizeWhatsapp(data.whatsappNumber)))
      .catch(() => {});
  }, [isAdmin]);

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=Hi%20Crown%20Store%20PK!%20I'm%20interested%20in%20your%20jewelry.`}
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <IconMessageCircle width="26" height="26" />
        </a>
      )}
    </>
  );
}
