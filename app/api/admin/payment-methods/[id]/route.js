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
      if (['name', 'instructions'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      if (key === 'type') {
        fields.push('type = ?');
        values.push(value === 'cod' ? 'cod' : 'manual');
      }
      if (key === 'extraFee') {
        fields.push('extraFee = ?');
        values.push(parseFloat(value) || 0);
      }
      if (key === 'sortOrder') {
        fields.push('sortOrder = ?');
        values.push(parseInt(value, 10) || 0);
      }
      if (key === 'enabled') {
        fields.push('enabled = ?');
        values.push(value ? 1 : 0);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    if (body.enabled === false) {
      // Never let the last enabled payment method be turned off — checkout
      // must always have at least one way for a customer to pay.
      const otherEnabled = db.prepare('SELECT COUNT(*) as count FROM payment_methods WHERE enabled = 1 AND id != ?').get(id).count;
      if (otherEnabled === 0) {
        return NextResponse.json({ error: 'At least one payment method must stay enabled.' }, { status: 400 });
      }
    }

    values.push(id);
    db.prepare(`UPDATE payment_methods SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return NextResponse.json({ message: 'Payment method updated' });
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

    const method = db.prepare('SELECT enabled FROM payment_methods WHERE id = ?').get(id);
    if (method?.enabled) {
      const otherEnabled = db.prepare('SELECT COUNT(*) as count FROM payment_methods WHERE enabled = 1 AND id != ?').get(id).count;
      if (otherEnabled === 0) {
        return NextResponse.json({ error: 'At least one payment method must stay enabled. Add another before deleting this one.' }, { status: 400 });
      }
    }

    db.prepare('DELETE FROM payment_methods WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Payment method deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
