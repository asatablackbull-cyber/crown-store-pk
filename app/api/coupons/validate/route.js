import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();
    const result = validateCoupon(code, parseFloat(subtotal) || 0);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      discountAmount: result.discountAmount
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
