import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = getDb();
  const coupons = db.prepare('SELECT * FROM coupons ORDER BY createdAt DESC').all();
  return NextResponse.json(coupons);
}

export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, usageLimit, expiresAt, active } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and discount value are required' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO coupons (code, discountType, discountValue, minOrderAmount, usageLimit, expiresAt, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      code.trim().toUpperCase(),
      discountType === 'fixed' ? 'fixed' : 'percent',
      parseFloat(discountValue),
      minOrderAmount ? parseFloat(minOrderAmount) : 0,
      usageLimit ? parseInt(usageLimit, 10) : null,
      expiresAt || null,
      active === false ? 0 : 1
    );

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Coupon created' }, { status: 201 });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
