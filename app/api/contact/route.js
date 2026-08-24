import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }

    db.prepare('INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)').run(
      name, email, phone || '', subject || '', message
    );

    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
