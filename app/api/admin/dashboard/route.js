import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != ?').get('cancelled').total;
    const pendingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('pending').count;
    const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE isRead = 0').get().count;
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5').all().map(o => ({
      ...o, items: JSON.parse(o.items)
    }));
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC LIMIT 10').all();

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalContacts,
      recentOrders,
      contacts
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
