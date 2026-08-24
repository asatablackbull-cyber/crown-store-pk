import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin, getUserFromRequest } from '@/lib/auth';
import { getSetting } from '@/lib/settings';
import { validateCoupon, incrementCouponUsage } from '@/lib/coupons';
import { sendOrderNotification } from '@/lib/mail';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  try {
    const db = getDb();
    const user = getUserFromRequest(request);

    if (user && user.role === 'admin') {
      const orders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
      return NextResponse.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
    }

    if (user) {
      const orders = db.prepare('SELECT * FROM orders WHERE email = ? ORDER BY createdAt DESC').all(user.email);
      return NextResponse.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { customerName, phone, email, address, city, items, notes, couponCode, paymentMethod } = body;

    if (!customerName || !phone || !address || !city || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Never trust prices/names from the client — look up each item by slug and
    // re-price it server-side, otherwise a tampered request could check out at
    // any price the client feels like sending.
    const verifiedItems = [];
    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (!item.slug || !Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json({ error: 'Invalid item in cart' }, { status: 400 });
      }
      const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(item.slug);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.slug}` }, { status: 400 });
      }
      verifiedItems.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: JSON.parse(product.images || '[]')[0] || '/images/products/logo.jpg',
        size: item.size || '',
        quantity
      });
    }

    const subtotal = verifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const result = validateCoupon(couponCode, subtotal);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      discountAmount = result.discountAmount;
      appliedCoupon = result.coupon.code;
    }

    const method = paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cod';
    const codFee = method === 'cod' ? (parseFloat(getSetting('codFee', '0')) || 0) : 0;
    const shippingCost = codFee;
    const total = Math.max(0, subtotal - discountAmount + shippingCost);
    const orderNumber = 'CS-' + uuidv4().substring(0, 8).toUpperCase();

    const result = db.prepare(`
      INSERT INTO orders (orderNumber, customerName, phone, email, address, city, items, subtotal, shippingCost, total, notes, paymentMethod, couponCode, discountAmount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderNumber, customerName, phone, email || '', address, city,
      JSON.stringify(verifiedItems), subtotal, shippingCost, total, notes || '', method,
      appliedCoupon, discountAmount
    );

    if (appliedCoupon) {
      incrementCouponUsage(appliedCoupon);
    }

    const order = {
      id: result.lastInsertRowid, orderNumber, customerName, phone, email, address, city,
      items: verifiedItems, subtotal, shippingCost, total, notes, paymentMethod: method, couponCode: appliedCoupon, discountAmount
    };
    await sendOrderNotification(order);

    return NextResponse.json({
      id: result.lastInsertRowid,
      orderNumber,
      subtotal,
      discountAmount,
      shippingCost,
      total,
      message: 'Order placed successfully!'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
