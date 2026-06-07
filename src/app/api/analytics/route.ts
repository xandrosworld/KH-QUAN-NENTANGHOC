import { NextResponse } from 'next/server';
import { buildAnalytics } from '@/lib/server/analytics';
import { getActiveRecords } from '@/lib/server/data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const records = await getActiveRecords();
  return NextResponse.json(buildAnalytics(records));
}
