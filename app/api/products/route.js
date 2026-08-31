import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getProducts } from '@/lib/products';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const products = getProducts({
      category: searchParams.get('category'),
      featured: searchParams.get('featured') === 'true',
      search: searchParams.get('search')
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const body = await request.json();
    const { name, slug, description, shortDescription, price, comparePrice, category, images, sizes, unavailableSizes, material, featured, ribbon, sku, weight, inStock } = body;

    const result = db.prepare(`
      INSERT INTO products (name, slug, description, shortDescription, price, comparePrice, category, images, sizes, unavailableSizes, material, featured, ribbon, sku, weight, inStock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, slug, description || '', shortDescription || '', price, comparePrice || null,
      category || 'jewelry', JSON.stringify(images || []), JSON.stringify(sizes || []), JSON.stringify(unavailableSizes || []),
      material || '316L Stainless Steel', featured ? 1 : 0,
      ribbon || null, sku || null, weight || null, inStock === false ? 0 : 1
    );

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Product created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
