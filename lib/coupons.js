import getDb from './db';

export function validateCoupon(code, subtotal) {
  if (!code) return { error: 'No coupon code provided' };
  const db = getDb();
  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ?').get(code.trim().toUpperCase());

  if (!coupon) return { error: 'Invalid coupon code' };
  if (!coupon.active) return { error: 'This coupon is no longer active' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { error: 'This coupon has expired' };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { error: 'This coupon has reached its usage limit' };
  if (subtotal < coupon.minOrderAmount) {
    return { error: `Minimum order of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this coupon` };
  }

  const discountAmount = coupon.discountType === 'fixed'
    ? Math.min(coupon.discountValue, subtotal)
    : Math.round(subtotal * (coupon.discountValue / 100));

  return { coupon, discountAmount };
}

export function incrementCouponUsage(code) {
  const db = getDb();
  db.prepare('UPDATE coupons SET usedCount = usedCount + 1 WHERE code = ?').run(code.trim().toUpperCase());
}
