import Link from 'next/link';
import ProductCard from './components/ProductCard';
import Reveal from './components/Reveal';
import { IconDroplet, IconShield, IconPackage, IconSparkles, IconGear, IconGem, IconStar, IconCheck } from './components/Icons';
import { getProducts } from '@/lib/products';

export const revalidate = 30;

const testimonials = [
  {
    name: 'Ahmed Raza',
    location: 'Lahore',
    initials: 'AR',
    rating: 5,
    text: 'Ordered the Royal Mesh Bracelet & Ring Set for my brother’s wedding. The gold plating still looks brand new after months of daily wear. Worth every rupee.',
  },
  {
    name: 'Ayesha Khan',
    location: 'Karachi',
    initials: 'AK',
    rating: 5,
    text: 'I was skeptical about ordering jewelry online but the Yin Yang bracelet set exceeded expectations. The packaging alone felt like a luxury unboxing.',
  },
  {
    name: 'Bilal Ahmed',
    location: 'Islamabad',
    initials: 'BA',
    rating: 4,
    text: 'Cash on Delivery made it easy to trust the purchase. The Crown Signet Ring fits perfectly and hasn’t tarnished even after gym sessions.',
  },
  {
    name: 'Sana Malik',
    location: 'Faisalabad',
    initials: 'SM',
    rating: 5,
    text: 'Bought this as a gift and it arrived within 3 days. My husband loves that the bangle doesn’t turn his wrist green like his old jewelry did.',
  },
  {
    name: 'Hamza Sheikh',
    location: 'Rawalpindi',
    initials: 'HS',
    rating: 5,
    text: 'Genuinely waterproof — I’ve worn the bracelet swimming multiple times and it still looks flawless. WhatsApp support was also very responsive.',
  },
  {
    name: 'Zainab Iqbal',
    location: 'Multan',
    initials: 'ZI',
    rating: 4,
    text: 'Great quality for the price. Delivery took a little longer than expected but the product more than made up for it.',
  },
];

export default function HomePage() {
  const products = getProducts({ featured: true });

  return (
    <>
      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <img src="/images/banners/hero-banner.jpg" alt="Crown Store PK Luxury Jewelry" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">✦ Precision Crafted Luxury ✦</div>
          <h1>
            Wear Your
            <span className="gold">Confidence</span>
          </h1>
          <p>
            Marine-grade 316L stainless steel jewelry — 100% waterproof, sweat-resistant, and tarnish-proof.
            Designed to last. Delivered across Pakistan with flexible payment options.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Explore Collection
            </Link>
            <Link href="/about" className="btn btn-outline btn-lg">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="features-grid">
          <Reveal as="div" className="feature-card">
            <div className="feature-icon"><IconDroplet /></div>
            <h3 className="feature-title">100% Waterproof</h3>
            <p className="feature-text">Shower, swim, sweat — our jewelry stays flawless every time.</p>
          </Reveal>
          <Reveal as="div" className="feature-card" delay={80}>
            <div className="feature-icon"><IconShield /></div>
            <h3 className="feature-title">Tarnish-Proof</h3>
            <p className="feature-text">316L marine-grade steel. No rust, no fade, no irritation — guaranteed.</p>
          </Reveal>
          <Reveal as="div" className="feature-card" delay={160}>
            <div className="feature-icon"><IconPackage /></div>
            <h3 className="feature-title">Flexible Payment</h3>
            <p className="feature-text">Choose from multiple payment options at checkout, including Cash on Delivery.</p>
          </Reveal>
          <Reveal as="div" className="feature-card" delay={240}>
            <div className="feature-icon"><IconSparkles /></div>
            <h3 className="feature-title">Luxury Packaging</h3>
            <p className="feature-text">Every piece arrives in premium bespoke packaging, ready to gift.</p>
          </Reveal>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" id="featured-products">
        <Reveal className="section-header">
          <div className="section-label">Our Collection</div>
          <h2 className="section-title">Featured Pieces</h2>
          <p className="section-subtitle">
            Handcrafted from the finest materials — each piece is a testament to precision and elegance.
          </p>
          <div className="section-divider" />
        </Reveal>

        <div className="products-grid">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 70}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/shop" className="btn btn-outline">
            View All Products →
          </Link>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="brand-story" id="brand-story">
        <Reveal className="brand-story-image">
          <img src="/images/banners/about-craftsmanship.jpg" alt="Crown Store PK Craftsmanship" />
        </Reveal>
        <Reveal className="brand-story-content" delay={120}>
          <div className="section-label">Our Story</div>
          <h2>Engineered for the Modern Individual</h2>
          <p>
            At Crown Store PK, we redefine modern everyday luxury through minimalism, resilience,
            and uncompromised confidence. Engineered specifically for individuals who value clean
            aesthetics and lasting quality.
          </p>
          <p>
            Our jewelry is crafted from marine-grade 316L stainless steel, genuine black onyx,
            and veined arctic marble. Every pendant and chain in our collection is 100% waterproof,
            sweat-resistant, and tarnish-proof.
          </p>
          <p>
            Designed never to rust, fade, or irritate sensitive skin — whether worn in the gym,
            at work, or during high-profile evenings.
          </p>
          <Link href="/about" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            Learn More About Us
          </Link>
        </Reveal>
      </section>

      {/* MATERIAL HIGHLIGHTS */}
      <section className="section section-alt-bg">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Reveal className="section-header">
            <div className="section-label">Premium Materials</div>
            <h2 className="section-title">What Sets Us Apart</h2>
            <div className="section-divider" />
          </Reveal>
          <div className="features-grid features-grid-3">
            <Reveal as="div" className="feature-card" style={{ borderColor: 'var(--color-border-gold)' }}>
              <div className="feature-icon"><IconGear /></div>
              <h3 className="feature-title">316L Stainless Steel</h3>
              <p className="feature-text">
                Marine-grade steel used in surgical instruments and luxury watches.
                Hypoallergenic and virtually indestructible.
              </p>
            </Reveal>
            <Reveal as="div" className="feature-card" delay={80} style={{ borderColor: 'var(--color-border-gold)' }}>
              <div className="feature-icon"><IconGem /></div>
              <h3 className="feature-title">Genuine Black Onyx</h3>
              <p className="feature-text">
                Hand-selected natural black onyx stones with a deep, lustrous finish
                that symbolizes strength and protection.
              </p>
            </Reveal>
            <Reveal as="div" className="feature-card" delay={160} style={{ borderColor: 'var(--color-border-gold)' }}>
              <div className="feature-icon"><IconSparkles /></div>
              <h3 className="feature-title">Arctic Marble</h3>
              <p className="feature-text">
                Naturally veined white marble beads that bring a calming,
                sophisticated contrast to every piece.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="testimonials">
        <Reveal className="section-header">
          <div className="section-label">Customer Love</div>
          <h2 className="section-title">Trusted Across Pakistan</h2>
          <p className="section-subtitle">
            Real reviews from real customers — from Karachi to Islamabad.
          </p>
          <div className="section-divider" />
        </Reveal>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <Reveal as="div" className="testimonial-card" delay={(i % 3) * 90} key={t.name}>
              <div className="testimonial-stars">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <IconStar key={s} />
                ))}
              </div>
              <p className="testimonial-text">“{t.text}”</p>
              <div className="testimonial-person">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-location">{t.location}</div>
                  <div className="testimonial-verified"><IconCheck width="12" height="12" /> Verified Purchase</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal as="section" className="section" style={{ textAlign: 'center' }}>
        <div className="section-label">Ready to Elevate Your Style?</div>
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
          Join the Crown Movement
        </h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          Thousands of individuals across Pakistan trust Crown Store PK for timeless,
          high-end jewelry at affordable prices. Nationwide delivery. Flexible payment options.
        </p>
        <Link href="/shop" className="btn btn-primary btn-lg">
          Shop Now →
        </Link>
      </Reveal>
    </>
  );
}
