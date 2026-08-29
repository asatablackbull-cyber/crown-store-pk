export const metadata = {
  title: 'Shipping Policy — Crown Store PK',
  description: 'Delivery timeframes, Cash on Delivery process, and shipping details for Crown Store PK orders.',
};

export default function ShippingPolicyPage() {
  return (
    <>
      <div className="page-header">
        <div className="section-label">Legal</div>
        <h1>Shipping Policy</h1>
        <p>Free delivery across Pakistan, with Cash on Delivery available nationwide.</p>
      </div>
      <div className="legal-content">
        <p className="legal-updated">Last updated: August 2026</p>

        <h2>1. Delivery Coverage</h2>
        <p>
          We deliver to all major cities and most areas across Pakistan, including Karachi, Lahore,
          Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and beyond. Shipping is free on every
          order — no minimum purchase required.
        </p>

        <h2>2. Delivery Timeframes</h2>
        <ul>
          <li><strong>Major cities</strong> (Karachi, Lahore, Islamabad, Rawalpindi): 2–4 business days.</li>
          <li><strong>Other cities and towns:</strong> 4–7 business days.</li>
          <li><strong>Remote areas:</strong> 7–10 business days, depending on courier coverage.</li>
        </ul>
        <p>
          Orders are processed within 24–48 hours of confirmation. You&apos;ll receive a confirmation message
          once your order is placed, and tracking details once it ships.
        </p>

        <h2>3. Cash on Delivery (COD)</h2>
        <p>
          Cash on Delivery is available across Pakistan. Please have the exact order amount ready for our
          courier partner at the time of delivery. A small COD handling fee may apply depending on your
          order value and location — this will always be shown clearly at checkout before you confirm your
          order.
        </p>

        <h2>4. Online Payment Orders</h2>
        <p>
          If online payment is enabled at checkout, your order is processed as soon as payment is confirmed.
          Delivery timeframes are the same as COD orders.
        </p>

        <h2>5. Order Tracking</h2>
        <p>
          You can track your order status anytime from the <a href="/orders">Track Order</a> page using your
          order number and phone number.
        </p>

        <h2>6. Failed or Missed Deliveries</h2>
        <p>
          Our courier partner will attempt delivery and contact you using the phone number provided at
          checkout. Please ensure your address and phone number are accurate. If a delivery attempt fails,
          the courier will typically retry or hold the parcel briefly before returning it to us — please stay
          reachable on your registered number so we can help resolve this quickly.
        </p>

        <h2>7. Delays</h2>
        <p>
          While we work with reliable courier partners, delivery times can occasionally be affected by
          weather, public holidays, or events outside our control. We&apos;ll keep you informed if your order
          is delayed.
        </p>

        <h2>8. Questions</h2>
        <p>
          For anything shipping-related, message us on{' '}
          <a href="https://wa.me/923001234567" target="_blank" rel="noopener">WhatsApp</a> or email{' '}
          <a href="mailto:support@crownstore.pk">support@crownstore.pk</a>.
        </p>
      </div>
    </>
  );
}
