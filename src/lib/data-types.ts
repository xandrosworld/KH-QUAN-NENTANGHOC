import type {
  ChartDataPoint,
  ChannelProfit,
  ChannelRevenue,
  CostStructureItem,
  DataManagementRow,
  FileDetail,
  KpiMetric,
  ProfitDetailRow,
  RevenueDetailRow,
  TopCampaign,
  TopProduct,
} from './types';

export type ImportSource = 'shopee' | 'tiktok' | 'lazada' | 'ads' | 'giavon';

export type NormalizedRecordType = 'order' | 'ads' | 'cogs';

export type NormalizedOrderStatus = 'success' | 'cancelled' | 'refunded' | 'unknown';

export interface NormalizedRecord {
  id: string;
  importJobId: string;
  ownerUserId?: string;
  source: ImportSource;
  channel: string;
  type: NormalizedRecordType;
  date: string;
  orderId?: string;
  productName?: string;
  sku?: string;
  campaignName?: string;
  status: NormalizedOrderStatus;
  quantity: number;
  revenue: number;
  platformFee: number;
  refundAmount: number;
  adsCost: number;
  cogs: number;
  raw: Record<string, unknown>;
}

export interface ImportJob {
  id: string;
  ownerUserId?: string;
  fileName: string;
  source: ImportSource;
  sourceLabel: string;
  dataType: string;
  fileSize: number;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: 'success' | 'error' | 'processing';
  importedBy: string;
  importedAt: string;
  dateRangeFrom?: string;
  dateRangeTo?: string;
  errors: string[];
  preview: Record<string, unknown>[];
}

export interface ImportResult {
  job: ImportJob;
  records: NormalizedRecord[];
}

export interface ImportListResponse {
  jobs: ImportJob[];
  rows: DataManagementRow[];
  fileDetail: FileDetail | null;
  summary: {
    total: number;
    success: number;
    error: number;
    processing: number;
  };
}

export interface AnalyticsActiveFilters {
  from?: string;
  to?: string;
  source?: ImportSource;
  product?: string;
  campaign?: string;
}

export interface AnalyticsFilterOptions {
  dateRange: {
    from?: string;
    to?: string;
  };
  sources: {
    value: ImportSource;
    label: string;
  }[];
  products: string[];
  campaigns: string[];
}

export interface AnalyticsPayload {
  dashboardKpis: KpiMetric[];
  revenueKpis: KpiMetric[];
  profitKpis: KpiMetric[];
  revenueChartData: ChartDataPoint[];
  revenueByTimeData: ChartDataPoint[];
  profitChartData: ChartDataPoint[];
  channelRevenue: ChannelRevenue[];
  topProducts: TopProduct[];
  topCampaigns: TopCampaign[];
  revenueDetailRows: RevenueDetailRow[];
  profitDetailRows: ProfitDetailRow[];
  costStructure: CostStructureItem[];
  channelProfits: ChannelProfit[];
  totals: {
    revenue: number;
    orders: number;
    soldProducts: number;
    aov: number;
    refundRate: number;
    refundAmount: number;
    platformFee: number;
    adsCost: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
    margin: number;
    roas: number;
    cpa: number;
  };
  dataQuality: {
    cogsAvailable: boolean;
    profitMode: 'full' | 'before-cogs';
    warnings: string[];
  };
  activeFilters?: AnalyticsActiveFilters;
  availableFilters?: AnalyticsFilterOptions;
  recordCount?: {
    total: number;
    filtered: number;
  };
}
