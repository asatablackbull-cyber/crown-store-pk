import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();
    const { id } = await params;
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
