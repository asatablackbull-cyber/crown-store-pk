export const metadata = {
  title: 'Privacy Policy — Crown Store PK',
  description: 'How Crown Store PK collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="page-header">
        <div className="section-label">Legal</div>
        <h1>Privacy Policy</h1>
        <p>Your privacy matters to us. Here&apos;s exactly what we collect and how it&apos;s used.</p>
      </div>
      <div className="legal-content">
        <p className="legal-updated">Last updated: August 2026</p>

        <h2>1. Information We Collect</h2>
        <p>
          When you place an order, create an account, or contact us, we collect information such as your
          name, phone number, email address, shipping address, and city. If you pay online, payment details
          are processed securely by our payment provider — we never store your card or bank details on our
          own servers.
        </p>
        <p>
          We also automatically collect basic technical information (like browser type and pages visited) to
          help us keep the website running smoothly and to understand how customers use our store.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To process and deliver your orders, including Cash on Delivery orders.</li>
          <li>To send order confirmations, shipping updates, and respond to your inquiries.</li>
          <li>To manage your account, order history, and wishlist.</li>
          <li>To improve our products, website experience, and customer service.</li>
          <li>To send you promotional updates, only if you&apos;ve opted in — you can unsubscribe anytime.</li>
        </ul>

        <h2>3. Sharing Your Information</h2>
        <p>
          We do not sell or rent your personal information to third parties. We only share what&apos;s
          necessary with trusted partners who help us run the business — such as courier companies (to
          deliver your order) and payment processors (to complete online transactions). These partners are
          only given the information they need to perform their service.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We take reasonable technical and organizational measures to protect your personal information from
          unauthorized access, loss, or misuse. However, no method of transmission over the internet is
          100% secure, and we cannot guarantee absolute security.
        </p>

        <h2>5. Cookies</h2>
        <p>
          Our website uses basic cookies and browser local storage to keep your cart, login session, and
          preferences working correctly. We do not use cookies for third-party advertising tracking.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You can request to view, update, or delete the personal information we hold about you at any time
          by contacting us. If you have an account, you can also update most of your details directly from
          your account page.
        </p>

        <h2>7. Children&apos;s Privacy</h2>
        <p>
          Crown Store PK is not intended for children under 13, and we do not knowingly collect personal
          information from children.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices. Any
          changes will be posted on this page with an updated revision date.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or how your data is handled, reach out to us
          at <a href="mailto:support@crownstore.pk">support@crownstore.pk</a> or via{' '}
          <a href="https://wa.me/923001234567" target="_blank" rel="noopener">WhatsApp</a>.
        </p>
      </div>
    </>
  );
}
