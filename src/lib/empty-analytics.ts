import type { AnalyticsPayload } from './data-types';
import type { KpiMetric } from './types';

const zeroSparkline = Array.from({ length: 12 }, () => 0);

const dashboardKpis: KpiMetric[] = [
  { id: 'revenue', title: 'Doanh thu', value: '0 đ', change: 0, changeLabel: 'so với kỳ trước', icon: 'Wallet', color: 'green', sparklineData: zeroSparkline },
  { id: 'orders', title: 'Đơn hàng', value: '0', change: 0, changeLabel: 'so với kỳ trước', icon: 'ShoppingBag', color: 'purple', sparklineData: zeroSparkline },
  { id: 'aov', title: 'AOV', value: '0 đ', change: 0, changeLabel: 'so với kỳ trước', icon: 'CreditCard', color: 'orange', sparklineData: zeroSparkline },
  { id: 'sold-products', title: 'Sản phẩm đã bán', value: '0', change: 0, changeLabel: 'so với kỳ trước', icon: 'ArrowUpDown', color: 'blue', sparklineData: zeroSparkline },
  { id: 'refund-rate', title: 'Tỷ lệ hoàn hàng', value: '0%', change: 0, changeLabel: 'so với kỳ trước', icon: 'RefreshCcw', color: 'red', sparklineData: zeroSparkline },
];

const profitKpis: KpiMetric[] = [
  { id: 'gross-profit', title: 'Gross Profit', value: '0 đ', change: 0, changeLabel: 'so với kỳ trước', icon: 'TrendingUp', color: 'green', sparklineData: zeroSparkline },
  { id: 'net-profit', title: 'Net Profit', value: '0 đ', change: 0, changeLabel: 'so với kỳ trước', icon: 'DollarSign', color: 'blue', sparklineData: zeroSparkline },
  { id: 'margin', title: 'Margin', value: '0%', change: 0, changeLabel: 'so với kỳ trước', icon: 'Percent', color: 'purple', sparklineData: zeroSparkline },
  { id: 'ads-cost', title: 'Ads', value: '0 đ', change: 0, changeLabel: 'so với kỳ trước', icon: 'Megaphone', color: 'orange', sparklineData: zeroSparkline },
  { id: 'roas', title: 'ROAS', value: '0.00x', change: 0, changeLabel: 'so với kỳ trước', icon: 'Zap', color: 'yellow', sparklineData: zeroSparkline },
  { id: 'cpa', title: 'CPA', value: '0 đ', change: 0, changeLabel: 'so với kỳ trước', icon: 'Target', color: 'red', sparklineData: zeroSparkline },
];

export const emptyAnalyticsPayload: AnalyticsPayload = {
  dashboardKpis,
  revenueKpis: dashboardKpis,
  profitKpis,
  revenueChartData: [],
  revenueByTimeData: [],
  profitChartData: [],
  channelRevenue: [],
  topProducts: [],
  topCampaigns: [],
  revenueDetailRows: [],
  profitDetailRows: [],
  costStructure: [],
  channelProfits: [],
  totals: {
    revenue: 0,
    orders: 0,
    soldProducts: 0,
    aov: 0,
    refundRate: 0,
    refundAmount: 0,
    platformFee: 0,
    adsCost: 0,
    cogs: 0,
    grossProfit: 0,
    netProfit: 0,
    margin: 0,
    roas: 0,
    cpa: 0,
  },
  dataQuality: {
    cogsAvailable: false,
    profitMode: 'before-cogs',
    warnings: ['Chưa có dữ liệu giá vốn; các chỉ số lợi nhuận đang được trình bày trước giá vốn.'],
  },
  availableFilters: {
    dateRange: {},
    sources: [],
    products: [],
    campaigns: [],
  },
  recordCount: {
    total: 0,
    filtered: 0,
  },
};
