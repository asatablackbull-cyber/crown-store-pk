import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getProductBySlug } from '@/lib/products';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const product = getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
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
    const { slug } = await params;
    const body = await request.json();
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {
      if (['name', 'description', 'shortDescription', 'price', 'comparePrice', 'category', 'material', 'ribbon', 'sku', 'weight'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      if (key === 'images' || key === 'sizes' || key === 'unavailableSizes') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      }
      if (key === 'inStock' || key === 'featured') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(slug);
    db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE slug = ?`).run(...values);
    return NextResponse.json({ message: 'Product updated' });
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
    const { slug } = await params;
    db.prepare('DELETE FROM products WHERE slug = ?').run(slug);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
