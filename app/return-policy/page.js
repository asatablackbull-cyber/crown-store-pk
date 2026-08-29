export const metadata = {
  title: 'Return & Refund Policy — Crown Store PK',
  description: 'Our return, exchange, and refund process for Crown Store PK orders.',
};

export default function ReturnPolicyPage() {
  return (
    <>
      <div className="page-header">
        <div className="section-label">Legal</div>
        <h1>Return &amp; Refund Policy</h1>
        <p>We want you to love your piece. Here&apos;s how returns and exchanges work.</p>
      </div>
      <div className="legal-content">
        <p className="legal-updated">Last updated: August 2026</p>

        <h2>1. Return Window</h2>
        <p>
          You may request a return or exchange within <strong>7 days</strong> of receiving your order. To be
          eligible, the item must be unused, unworn, and in its original packaging with all tags attached.
        </p>

        <h2>2. Non-Returnable Situations</h2>
        <ul>
          <li>Items that show signs of wear, damage, or alteration after delivery.</li>
          <li>Items returned without their original packaging.</li>
          <li>Requests made after the 7-day return window has passed.</li>
        </ul>

        <h2>3. Defective or Wrong Items</h2>
        <p>
          If you receive a defective, damaged, or incorrect item, please contact us within 48 hours of
          delivery with photos of the product and packaging. We will arrange a free replacement or a full
          refund — your choice — at no extra cost to you.
        </p>

        <h2>4. How to Request a Return</h2>
        <p>
          Message us on <a href="https://wa.me/923001234567" target="_blank" rel="noopener">WhatsApp</a> or
          email <a href="mailto:support@crownstore.pk">support@crownstore.pk</a> with your order number and
          the reason for return. Our team will guide you through the next steps, including pickup or
          drop-off details.
        </p>

        <h2>5. Refunds</h2>
        <p>
          Once we receive and inspect the returned item, we&apos;ll notify you of the approval status. Approved
          refunds for Cash on Delivery orders are processed via bank transfer or Easypaisa/JazzCash within
          5–7 business days. Refunds for online payments are credited back to the original payment method
          within 7–10 business days, depending on your bank.
        </p>

        <h2>6. Exchanges</h2>
        <p>
          Want a different size or design instead of a refund? Let us know when you reach out — we&apos;re
          happy to arrange a straightforward exchange, subject to product availability.
        </p>

        <h2>7. Return Shipping</h2>
        <p>
          For change-of-mind returns, return shipping is the customer&apos;s responsibility. For defective,
          damaged, or incorrect items, we cover the return shipping cost.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          Have a question before you buy, or need help with an existing order? Reach out at{' '}
          <a href="mailto:support@crownstore.pk">support@crownstore.pk</a> — we&apos;re happy to help.
        </p>
      </div>
    </>
  );
}
