import nodemailer from 'nodemailer';
import { getAllSettings } from './settings';

function getTransporter(settings) {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) return null;
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: parseInt(settings.smtpPort, 10) || 587,
    secure: settings.smtpSecure === '1',
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass
    }
  });
}

export async function sendTestEmail(toOverride) {
  const settings = getAllSettings();
  const transporter = getTransporter(settings);
  if (!transporter) throw new Error('SMTP is not fully configured (host, user and password are required).');

  const to = toOverride || settings.notificationEmail;
  if (!to) throw new Error('No notification email address is set.');

  await transporter.sendMail({
    from: settings.smtpFrom || settings.smtpUser,
    to,
    subject: 'Crown Store PK — Test Email',
    text: 'This is a test email from your Crown Store PK admin settings. If you received this, email notifications are working correctly.'
  });
}

export async function sendOrderNotification(order) {
  try {
    const settings = getAllSettings();
    if (!settings.notificationEmail) return;
    const transporter = getTransporter(settings);
    if (!transporter) return;

    const itemsList = order.items
      .map(i => `  - ${i.name} x${i.quantity}${i.size ? ` (${i.size})` : ''} — Rs. ${(i.price * i.quantity).toLocaleString()}`)
      .join('\n');

    await transporter.sendMail({
      from: settings.smtpFrom || settings.smtpUser,
      to: settings.notificationEmail,
      subject: `New Order ${order.orderNumber} — Rs. ${order.total.toLocaleString()}`,
      text: [
        `A new order has been placed on Crown Store PK.`,
        ``,
        `Order #: ${order.orderNumber}`,
        `Customer: ${order.customerName}`,
        `Phone: ${order.phone}`,
        `Email: ${order.email || 'N/A'}`,
        `Address: ${order.address}, ${order.city}`,
        `Payment: ${order.paymentMethod}`,
        order.couponCode ? `Coupon: ${order.couponCode} (-Rs. ${order.discountAmount})` : null,
        ``,
        `Items:`,
        itemsList,
        ``,
        `Total: Rs. ${order.total.toLocaleString()}`
      ].filter(Boolean).join('\n')
    });
  } catch (error) {
    // Never let a notification failure break order placement.
    console.error('Order notification email failed:', error.message);
  }
}
