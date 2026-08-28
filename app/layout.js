import { Fraunces, Public_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from './components/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import { IconMessageCircle } from './components/Icons';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Crown Store PK — Luxury Waterproof Jewelry',
  description: 'At Crown Store PK, we redefine modern everyday luxury. Marine-grade 316L stainless steel jewelry that is 100% waterproof, sweat-resistant, and tarnish-proof. Cash on Delivery across Pakistan.',
  keywords: 'jewelry, luxury jewelry, waterproof jewelry, stainless steel jewelry, Pakistan, bracelets, rings, pendants, Crown Store PK',
  openGraph: {
    title: 'Crown Store PK — Luxury Waterproof Jewelry',
    description: 'Redefining modern everyday luxury. 100% waterproof, sweat-resistant, tarnish-proof jewelry.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
          <a
            href="https://wa.me/923001234567?text=Hi%20Crown%20Store%20PK!%20I'm%20interested%20in%20your%20jewelry."
            className="whatsapp-float"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            <IconMessageCircle width="26" height="26" />
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
