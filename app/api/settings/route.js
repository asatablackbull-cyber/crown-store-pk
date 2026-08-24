import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getPublicSettings());
}
