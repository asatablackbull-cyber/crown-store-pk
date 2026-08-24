import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { sendTestEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await sendTestEmail();
    return NextResponse.json({ message: 'Test email sent successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
