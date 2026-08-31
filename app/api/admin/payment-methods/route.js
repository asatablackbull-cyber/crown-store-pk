import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getAllPaymentMethods } from '@/lib/paymentMethods';

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getAllPaymentMethods());
}

export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const body = await request.json();
    const { name, type, instructions, extraFee, enabled } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Payment method name is required' }, { status: 400 });
    }

    const maxOrder = db.prepare('SELECT COALESCE(MAX(sortOrder), -1) as maxOrder FROM payment_methods').get().maxOrder;

    const result = db.prepare(`
      INSERT INTO payment_methods (name, type, instructions, extraFee, enabled, sortOrder)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      type === 'cod' ? 'cod' : 'manual',
      instructions || '',
      extraFee ? parseFloat(extraFee) : 0,
      enabled === false ? 0 : 1,
      maxOrder + 1
    );

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Payment method created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
