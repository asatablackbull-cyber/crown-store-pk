import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin, getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const user = getUserFromRequest(request);

    // Public order tracking only works by the unguessable orderNumber, never by
    // sequential numeric id — otherwise anyone could enumerate every customer's
    // name, phone and address without authentication.
    let order;
    if (user?.role === 'admin') {
      order = db.prepare('SELECT * FROM orders WHERE id = ? OR orderNumber = ?').get(id, id);
    } else if (user) {
      order = db.prepare('SELECT * FROM orders WHERE (id = ? OR orderNumber = ?) AND email = ?').get(id, id, user.email);
    } else {
      order = db.prepare('SELECT * FROM orders WHERE orderNumber = ?').get(id);
    }

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ ...order, items: JSON.parse(order.items) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const { id } = await params;
    const { status } = await request.json();
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ message: 'Order updated' });
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
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Order deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
