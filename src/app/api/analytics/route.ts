import { NextResponse } from 'next/server';
import {
  buildAnalyticsFilterOptions,
  countFactRecords,
  filterAnalyticsRecords,
  getPreviousPeriodRecords,
  parseAnalyticsFilters,
} from '@/lib/analytics-filters';
import { buildAnalytics } from '@/lib/server/analytics';
import { requireApiSession } from '@/lib/server/api-auth';
import { getActiveRecords } from '@/lib/server/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const records = await getActiveRecords(auth.session.sub);
  const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
  const filteredRecords = filterAnalyticsRecords(records, filters);
  const previousPeriodRecords = getPreviousPeriodRecords(records, filters);

  return NextResponse.json({
    ...buildAnalytics(filteredRecords, previousPeriodRecords),
    activeFilters: filters,
    availableFilters: buildAnalyticsFilterOptions(records),
    recordCount: {
      total: countFactRecords(records),
      filtered: countFactRecords(filteredRecords),
    },
  });
}
