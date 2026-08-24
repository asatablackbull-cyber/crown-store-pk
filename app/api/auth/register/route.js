import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { hashSync } from 'bcryptjs';

export async function POST(request) {
  try {
    const db = getDb();
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = hashSync(password, 10);
    db.prepare('INSERT INTO users (name, email, passwordHash, phone) VALUES (?, ?, ?, ?)').run(
      name, email, passwordHash, phone || ''
    );

    return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
