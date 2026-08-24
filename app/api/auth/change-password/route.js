import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { compareSync, hashSync } from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authUser.id);
    if (!user || !compareSync(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(hashSync(newPassword, 10), user.id);
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
