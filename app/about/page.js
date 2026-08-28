import Link from 'next/link';
import { IconGear, IconGem, IconSparkles, IconTruck, IconCreditCard, IconCalendar, IconPackage } from '../components/Icons';
import Reveal from '../components/Reveal';

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="section-label">Our Story</div>
        <h1>About Crown Store PK</h1>
        <p>Redefining modern everyday luxury through minimalism, resilience, and uncompromised confidence.</p>
      </div>

      <section className="brand-story" id="story">
        <Reveal className="brand-story-image">
          <img src="/images/banners/about-craftsmanship.jpg" alt="Craftsmanship" />
        </Reveal>
        <Reveal className="brand-story-content" delay={120}>
          <div className="section-label">Who We Are</div>
          <h2>Crafted for the Modern Individual</h2>
          <p>
            At Crown Store PK, we redefine modern everyday luxury through minimalism, resilience, 
            and uncompromised confidence. Engineered specifically for individuals who value clean 
            aesthetics and lasting quality, our jewelry is crafted from marine-grade 316L stainless steel, 
            genuine black onyx, and veined arctic marble.
          </p>
          <p>
            Every pendant and chain in our collection is 100% waterproof, sweat-resistant, and 
            tarnish-proof — designed never to rust, fade, or irritate sensitive skin, whether worn 
            in the gym, at work, or during high-profile evenings.
          </p>
          <p>
            Backed by bespoke luxury packaging, nationwide Cash on Delivery across Pakistan, and a 
            commitment to precision craftsmanship, Crown Store PK bridges the gap between affordable 
            pricing and timeless, high-end design.
          </p>
        </Reveal>
      </section>

      <section className="section" id="materials" style={{ background: 'var(--color-bg-secondary)', maxWidth: '100%', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="section-header">
            <div className="section-label">Materials</div>
            <h2 className="section-title">Premium Craftsmanship</h2>
            <div className="section-divider" />
          </div>
          <div className="features-grid features-grid-3">
            <Reveal as="div" className="feature-card">
              <div className="feature-icon"><IconGear /></div>
              <h3 className="feature-title">316L Stainless Steel</h3>
              <p className="feature-text">Marine-grade steel used in surgical instruments and luxury watches. Hypoallergenic, corrosion-resistant, and virtually indestructible.</p>
            </Reveal>
            <Reveal as="div" className="feature-card" delay={80}>
              <div className="feature-icon"><IconGem /></div>
              <h3 className="feature-title">Genuine Black Onyx</h3>
              <p className="feature-text">Hand-selected natural black onyx stones with a deep, lustrous finish. Symbolizes strength, protection, and determination.</p>
            </Reveal>
            <Reveal as="div" className="feature-card" delay={160}>
              <div className="feature-icon"><IconSparkles /></div>
              <h3 className="feature-title">Arctic Marble</h3>
              <p className="feature-text">Naturally veined white marble beads that bring a calming, sophisticated contrast. Each bead is unique with its own natural pattern.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" id="shipping">
        <div className="section-header">
          <div className="section-label">Delivery</div>
          <h2 className="section-title">Shipping & Delivery</h2>
          <div className="section-divider" />
        </div>
        <div className="features-grid">
          <Reveal as="div" className="feature-card">
            <div className="feature-icon"><IconTruck /></div>
            <h3 className="feature-title">Free Shipping</h3>
            <p className="feature-text">Free delivery on all orders across Pakistan. No minimum order required.</p>
          </Reveal>
          <Reveal as="div" className="feature-card" delay={80}>
            <div className="feature-icon"><IconCreditCard /></div>
            <h3 className="feature-title">Cash on Delivery</h3>
            <p className="feature-text">Pay when your order arrives at your doorstep. No advance payment needed.</p>
          </Reveal>
          <Reveal as="div" className="feature-card" delay={160}>
            <div className="feature-icon"><IconCalendar /></div>
            <h3 className="feature-title">3-5 Business Days</h3>
            <p className="feature-text">Standard delivery takes 3-5 business days. We ship from Lahore & Karachi.</p>
          </Reveal>
          <Reveal as="div" className="feature-card" delay={240}>
            <div className="feature-icon"><IconPackage /></div>
            <h3 className="feature-title">Luxury Packaging</h3>
            <p className="feature-text">Every order arrives in premium bespoke packaging — ready to wear or gift.</p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Ready to Experience Crown Store PK?</h2>
        <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
          Join thousands of satisfied customers across Pakistan.
        </p>
        <Link href="/shop" className="btn btn-primary btn-lg">Shop Now →</Link>
      </section>
    </>
  );
}
