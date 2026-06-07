import type {
  AnalyticsActiveFilters,
  AnalyticsFilterOptions,
  ImportSource,
  NormalizedRecord,
} from './data-types';

const sourceLabels: Record<ImportSource, string> = {
  shopee: 'Shopee',
  tiktok: 'TikTok Shop',
  lazada: 'Lazada',
  ads: 'Ads',
  giavon: 'Gia von',
};

const sourceOrder: ImportSource[] = ['shopee', 'tiktok', 'lazada', 'ads', 'giavon'];

function removeDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export function normalizeFilterText(value: string) {
  return removeDiacritics(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function isImportSource(value: string | null): value is ImportSource {
  return value === 'shopee' || value === 'tiktok' || value === 'lazada' || value === 'ads' || value === 'giavon';
}

function cleanText(value: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function cleanDate(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return undefined;
  return trimmed;
}

export function parseAnalyticsFilters(searchParams: URLSearchParams): AnalyticsActiveFilters {
  const source = searchParams.get('source');

  return {
    from: cleanDate(searchParams.get('from')),
    to: cleanDate(searchParams.get('to')),
    source: isImportSource(source) ? source : undefined,
    product: cleanText(searchParams.get('product')),
    campaign: cleanText(searchParams.get('campaign')),
  };
}

export function buildAnalyticsSearchParams(filters: AnalyticsActiveFilters) {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.source) params.set('source', filters.source);
  if (filters.product?.trim()) params.set('product', filters.product.trim());
  if (filters.campaign?.trim()) params.set('campaign', filters.campaign.trim());
  return params;
}

function includesText(value: string | undefined, query: string | undefined) {
  if (!query) return true;
  return normalizeFilterText(value ?? '').includes(normalizeFilterText(query));
}

function matchesDate(record: NormalizedRecord, filters: AnalyticsActiveFilters) {
  if (filters.from && record.date < filters.from) return false;
  if (filters.to && record.date > filters.to) return false;
  return true;
}

function matchesSource(record: NormalizedRecord, filters: AnalyticsActiveFilters) {
  return !filters.source || record.source === filters.source;
}

function matchesProduct(record: NormalizedRecord, filters: AnalyticsActiveFilters) {
  if (!filters.product) return true;
  return includesText(`${record.productName ?? ''} ${record.sku ?? ''}`, filters.product);
}

function matchesCampaign(record: NormalizedRecord, filters: AnalyticsActiveFilters) {
  if (!filters.campaign) return true;
  return includesText(record.campaignName, filters.campaign);
}

function matchesFactRecord(record: NormalizedRecord, filters: AnalyticsActiveFilters) {
  if (!matchesDate(record, filters)) return false;
  if (!matchesSource(record, filters)) return false;
  if (!matchesProduct(record, filters)) return false;
  if (!matchesCampaign(record, filters)) return false;
  return true;
}

export function filterAnalyticsRecords(records: NormalizedRecord[], filters: AnalyticsActiveFilters) {
  const factRecords = records
    .filter((record) => record.type !== 'cogs')
    .filter((record) => matchesFactRecord(record, filters));

  const cogsRecords = records
    .filter((record) => record.type === 'cogs')
    .filter((record) => matchesProduct(record, filters));

  return [...factRecords, ...cogsRecords];
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'vi'));
}

export function buildAnalyticsFilterOptions(records: NormalizedRecord[]): AnalyticsFilterOptions {
  const factRecords = records.filter((record) => record.type !== 'cogs');
  const dates = uniqueSorted(factRecords.map((record) => record.date));
  const sourceSet = new Set(factRecords.map((record) => record.source));

  return {
    dateRange: {
      from: dates[0],
      to: dates[dates.length - 1],
    },
    sources: sourceOrder
      .filter((source) => sourceSet.has(source))
      .map((source) => ({ value: source, label: sourceLabels[source] })),
    products: uniqueSorted(records.flatMap((record) => [record.productName ?? '', record.sku ?? ''])).slice(0, 200),
    campaigns: uniqueSorted(records.map((record) => record.campaignName ?? '')).slice(0, 200),
  };
}

export function countFactRecords(records: NormalizedRecord[]) {
  return records.filter((record) => record.type !== 'cogs').length;
}
