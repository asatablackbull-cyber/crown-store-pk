import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {
      if (['discountType', 'expiresAt'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      if (['discountValue', 'minOrderAmount'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(parseFloat(value));
      }
      if (key === 'usageLimit') {
        fields.push(`${key} = ?`);
        values.push(value ? parseInt(value, 10) : null);
      }
      if (key === 'active') {
        fields.push('active = ?');
        values.push(value ? 1 : 0);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return NextResponse.json({ message: 'Coupon updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const { id } = await params;
    db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Coupon deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
