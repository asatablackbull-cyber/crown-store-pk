import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getCategories } from '@/lib/categories';

export async function GET() {
  return NextResponse.json(getCategories());
}

export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name.trim(), slug);
    return NextResponse.json({ id: result.lastInsertRowid, name: name.trim(), slug }, { status: 201 });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'A category with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
