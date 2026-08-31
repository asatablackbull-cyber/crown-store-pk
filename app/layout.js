import { Fraunces, Public_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from './components/CartContext';
import StoreChrome from './components/StoreChrome';

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
  description: 'At Crown Store PK, we redefine modern everyday luxury. Marine-grade 316L stainless steel jewelry that is 100% waterproof, sweat-resistant, and tarnish-proof. Nationwide delivery across Pakistan with flexible payment options.',
  keywords: 'jewelry, luxury jewelry, waterproof jewelry, stainless steel jewelry, Pakistan, bracelets, rings, pendants, Crown Store PK',
  openGraph: {
    title: 'Crown Store PK — Luxury Waterproof Jewelry',
    description: 'Redefining modern everyday luxury. 100% waterproof, sweat-resistant, tarnish-proof jewelry.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}
