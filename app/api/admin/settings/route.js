import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getAllSettings, updateSettings } from '@/lib/settings';

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getAllSettings());
}

export async function PUT(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const updated = updateSettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
