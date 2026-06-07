import { NextResponse } from 'next/server';
import {
  buildAnalyticsFilterOptions,
  countFactRecords,
  filterAnalyticsRecords,
  parseAnalyticsFilters,
} from '@/lib/analytics-filters';
import { buildAnalytics } from '@/lib/server/analytics';
import { getActiveRecords } from '@/lib/server/data-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const records = await getActiveRecords();
  const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
  const filteredRecords = filterAnalyticsRecords(records, filters);

  return NextResponse.json({
    ...buildAnalytics(filteredRecords),
    activeFilters: filters,
    availableFilters: buildAnalyticsFilterOptions(records),
    recordCount: {
      total: countFactRecords(records),
      filtered: countFactRecords(filteredRecords),
    },
  });
}
