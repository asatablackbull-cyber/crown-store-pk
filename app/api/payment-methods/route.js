import { NextResponse } from 'next/server';
import { getEnabledPaymentMethods } from '@/lib/paymentMethods';

export async function GET() {
  return NextResponse.json(getEnabledPaymentMethods());
}
