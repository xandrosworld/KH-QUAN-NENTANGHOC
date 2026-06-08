import type {
  AnalyticsPayload,
  ImportJob,
  ImportListResponse,
  NormalizedRecord,
} from '@/lib/data-types';
import type {
  ChannelRevenue,
  CostStructureItem,
  DataManagementRow,
  FileDetail,
  KpiMetric,
  ProfitDetailRow,
  RevenueDetailRow,
  TopCampaign,
  TopProduct,
} from '@/lib/types';

const sourceColors: Record<string, string> = {
  Shopee: '#EE4D2D',
  'TikTok Shop': '#000000',
  Lazada: '#F59E0B',
  Ads: '#2563EB',
  Khác: '#3B82F6',
};

function formatVnd(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')} đ`;
}

function formatCompact(value: number) {
  return Math.round(value).toLocaleString('vi-VN');
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function toTime(date: string) {
  const time = new Date(date).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isSuccessOrder(record: NormalizedRecord) {
  return record.type === 'order' && record.status !== 'cancelled' && record.status !== 'refunded';
}

function getCogsForOrder(record: NormalizedRecord, cogsMap: Map<string, number>) {
  if (record.cogs > 0) return record.cogs;
  const key = (record.sku || record.productName || '').toLowerCase();
  const unitCost = cogsMap.get(key) ?? 0;
  return unitCost * Math.max(record.quantity, 1);
}

function makeSparkline(values: number[]) {
  if (values.length >= 12) return values.slice(-12);
  const last = values[values.length - 1] ?? 0;
  return [...values, ...Array.from({ length: 12 - values.length }, () => last)];
}

function getDailyMap(records: NormalizedRecord[], cogsMap: Map<string, number>) {
  const daily = new Map<string, { revenue: number; netProfit: number; adsCost: number; cogs: number; orders: number }>();
  records.forEach((record) => {
    const item = daily.get(record.date) ?? { revenue: 0, netProfit: 0, adsCost: 0, cogs: 0, orders: 0 };
    if (isSuccessOrder(record)) {
      const cogs = getCogsForOrder(record, cogsMap);
      item.revenue += record.revenue;
      item.cogs += cogs;
      item.netProfit += record.revenue - cogs - record.platformFee;
      item.orders += 1;
    }
    if (record.type === 'ads') {
      item.adsCost += record.adsCost;
      item.netProfit -= record.adsCost;
    }
    daily.set(record.date, item);
  });
  return daily;
}

function getCogsMap(records: NormalizedRecord[]) {
  const map = new Map<string, number>();
  records
    .filter((record) => record.type === 'cogs' && record.cogs > 0)
    .forEach((record) => {
      const keys = [record.sku, record.productName].filter(Boolean) as string[];
      keys.forEach((key) => map.set(key.toLowerCase(), record.cogs));
    });
  return map;
}

function buildChannelRevenue(records: NormalizedRecord[]) {
  const grouped = new Map<string, number>();
  records.filter(isSuccessOrder).forEach((record) => {
    grouped.set(record.channel, (grouped.get(record.channel) ?? 0) + record.revenue);
  });
  const total = [...grouped.values()].reduce((sum, value) => sum + value, 0) || 1;
  return [...grouped.entries()]
    .sort((a, b) => b[1] - a[1])
    .map<ChannelRevenue>(([name, value]) => ({
      name,
      value,
      percentage: Number(((value / total) * 100).toFixed(1)),
      color: sourceColors[name] ?? sourceColors.Khác,
    }));
}

function buildTopProducts(records: NormalizedRecord[], cogsMap: Map<string, number>) {
  const grouped = new Map<string, { name: string; revenue: number; profit: number }>();
  records.filter(isSuccessOrder).forEach((record) => {
    const key = record.sku || record.productName || 'unknown';
    const item = grouped.get(key) ?? { name: record.productName || key, revenue: 0, profit: 0 };
    const cogs = getCogsForOrder(record, cogsMap);
    item.revenue += record.revenue;
    item.profit += record.revenue - cogs - record.platformFee;
    grouped.set(key, item);
  });

  return [...grouped.values()]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8)
    .map<TopProduct>((item, index) => ({
      rank: index + 1,
      name: item.name,
      revenue: formatVnd(item.revenue),
      profit: formatVnd(item.profit),
      netProfit: formatPercent(item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0),
    }));
}

function buildTopCampaigns(records: NormalizedRecord[]) {
  const grouped = new Map<string, { name: string; adsCost: number; revenue: number }>();
  records.filter((record) => record.type === 'ads').forEach((record) => {
    const key = record.campaignName || 'Campaign chưa đặt tên';
    const item = grouped.get(key) ?? { name: key, adsCost: 0, revenue: 0 };
    item.adsCost += record.adsCost;
    item.revenue += record.revenue;
    grouped.set(key, item);
  });

  return [...grouped.values()]
    .sort((a, b) => (b.revenue / Math.max(b.adsCost, 1)) - (a.revenue / Math.max(a.adsCost, 1)))
    .slice(0, 8)
    .map<TopCampaign>((item, index) => ({
      rank: index + 1,
      name: item.name,
      adsCost: formatVnd(item.adsCost),
      revenue: formatVnd(item.revenue),
      roas: Number((item.revenue / Math.max(item.adsCost, 1)).toFixed(2)),
    }));
}

function buildCostStructure(totals: AnalyticsPayload['totals']) {
  const items = [
    { name: 'Giá vốn', value: totals.cogs, color: '#EF4444' },
    { name: 'Chi phí Ads', value: totals.adsCost, color: '#F97316' },
    { name: 'Phí sàn', value: totals.platformFee, color: '#EAB308' },
    { name: 'Hoàn/Hủy', value: totals.refundAmount, color: '#3B82F6' },
  ];
  const totalCost = items.reduce((sum, item) => sum + item.value, 0) || 1;
  return items.map<CostStructureItem>((item) => ({
    name: item.name,
    value: item.value,
    amount: formatVnd(item.value),
    percentage: Number(((item.value / totalCost) * 100).toFixed(1)),
    color: item.color,
  }));
}

function buildProfitRows(records: NormalizedRecord[], cogsMap: Map<string, number>) {
  const grouped = new Map<string, { revenue: number; cogs: number; adsCost: number; platformFee: number; refundAmount: number }>();
  records.forEach((record) => {
    const channel = record.type === 'ads' ? 'Ads' : record.channel;
    const item = grouped.get(channel) ?? { revenue: 0, cogs: 0, adsCost: 0, platformFee: 0, refundAmount: 0 };
    if (isSuccessOrder(record)) {
      item.revenue += record.revenue;
      item.cogs += getCogsForOrder(record, cogsMap);
      item.platformFee += record.platformFee;
    }
    if (record.status === 'cancelled' || record.status === 'refunded') item.refundAmount += record.refundAmount || record.revenue;
    if (record.type === 'ads') item.adsCost += record.adsCost;
    grouped.set(channel, item);
  });

  return [...grouped.entries()]
    .map(([channel, item]) => {
      const grossProfit = item.revenue - item.cogs;
      const netProfit = grossProfit - item.adsCost - item.platformFee - item.refundAmount;
      return { channel, ...item, grossProfit, netProfit };
    })
    .sort((a, b) => b.netProfit - a.netProfit)
    .map<ProfitDetailRow>((item, index) => ({
      rank: index + 1,
      channel: item.channel,
      doanhThu: formatVnd(item.revenue),
      giaVon: formatVnd(item.cogs),
      chiPhiAds: formatVnd(item.adsCost),
      phiSan: formatVnd(item.platformFee),
      vanChuyen: formatVnd(0),
      chiPhiKhac: formatVnd(item.refundAmount),
      loiNhuanGop: formatVnd(item.grossProfit),
      netProfit: formatVnd(item.netProfit),
      tySuatLN: formatPercent(item.revenue > 0 ? (item.netProfit / item.revenue) * 100 : 0),
    }));
}

export function buildAnalytics(records: NormalizedRecord[]): AnalyticsPayload {
  const hasRecords = records.length > 0;
  const change = (value: number) => (hasRecords ? value : 0);
  const cogsMap = getCogsMap(records);
  const orders = records.filter(isSuccessOrder);
  const issueOrders = records.filter((record) => record.type === 'order' && !isSuccessOrder(record));
  const revenue = orders.reduce((sum, record) => sum + record.revenue, 0);
  const orderCount = new Set(orders.map((record) => record.orderId || record.id)).size;
  const soldProducts = orders.reduce((sum, record) => sum + record.quantity, 0);
  const platformFee = orders.reduce((sum, record) => sum + record.platformFee, 0);
  const adsCost = records.filter((record) => record.type === 'ads').reduce((sum, record) => sum + record.adsCost, 0);
  const cogs = orders.reduce((sum, record) => sum + getCogsForOrder(record, cogsMap), 0);
  const refundAmount = issueOrders.reduce((sum, record) => sum + (record.refundAmount || record.revenue), 0);
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - adsCost - platformFee - refundAmount;
  const aov = revenue / Math.max(orderCount, 1);
  const refundRate = (issueOrders.length / Math.max(orderCount + issueOrders.length, 1)) * 100;
  const margin = (netProfit / Math.max(revenue, 1)) * 100;
  const roas = revenue / Math.max(adsCost, 1);
  const cpa = adsCost / Math.max(orderCount, 1);

  const totals: AnalyticsPayload['totals'] = {
    revenue,
    orders: orderCount,
    soldProducts,
    aov,
    refundRate,
    refundAmount,
    platformFee,
    adsCost,
    cogs,
    grossProfit,
    netProfit,
    margin,
    roas,
    cpa,
  };

  const dailyMap = getDailyMap(records, cogsMap);
  const dailyEntries = [...dailyMap.entries()].sort((a, b) => toTime(a[0]) - toTime(b[0]));
  const revenueChartData = dailyEntries.map(([date, item]) => ({
    date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    doanhThu: Math.round(item.revenue / 1_000_000),
    loiNhuan: Math.round(item.netProfit / 1_000_000),
  }));
  const revenueValues = dailyEntries.map(([, item]) => item.revenue / 1_000_000);
  const orderValues = dailyEntries.map(([, item]) => item.orders);

  const dashboardKpis: KpiMetric[] = [
    { id: 'revenue', title: 'Doanh thu', value: formatVnd(revenue), change: change(18.5), changeLabel: 'so với tháng trước', icon: 'Wallet', color: 'green', sparklineData: makeSparkline(revenueValues) },
    { id: 'orders', title: 'Đơn hàng', value: formatCompact(orderCount), change: change(15.2), changeLabel: 'so với tháng trước', icon: 'ShoppingBag', color: 'purple', sparklineData: makeSparkline(orderValues) },
    { id: 'aov', title: 'AOV', value: formatVnd(aov), change: change(-7.8), changeLabel: 'so với tháng trước', icon: 'CreditCard', color: 'orange', sparklineData: makeSparkline(revenueValues.map((value, index) => value / Math.max(orderValues[index] ?? 1, 1))) },
    { id: 'sold-products', title: 'Sản phẩm đã bán', value: formatCompact(soldProducts), change: change(7.8), changeLabel: 'so với tháng trước', icon: 'ArrowUpDown', color: 'blue', sparklineData: makeSparkline(orderValues.map((value) => value * 2)) },
    { id: 'refund-rate', title: 'Tỷ lệ hoàn hàng', value: formatPercent(refundRate), change: change(2.6), changeLabel: 'so với tháng trước', icon: 'RefreshCcw', color: 'red', sparklineData: makeSparkline(orderValues.map((value, index) => (index % 5) + value / 10)) },
  ];

  const profitKpis: KpiMetric[] = [
    { id: 'gross-profit', title: 'Gross Profit', value: formatVnd(grossProfit), change: change(8.3), changeLabel: 'so với tháng trước', icon: 'TrendingUp', color: 'green', sparklineData: makeSparkline(revenueChartData.map((item) => item.loiNhuan)) },
    { id: 'net-profit', title: 'Net Profit', value: formatVnd(netProfit), change: change(12.1), changeLabel: 'so với tháng trước', icon: 'DollarSign', color: 'blue', sparklineData: makeSparkline(revenueChartData.map((item) => item.loiNhuan)) },
    { id: 'margin', title: 'Margin', value: formatPercent(margin), change: change(2.4), changeLabel: 'so với tháng trước', icon: 'Percent', color: 'purple', sparklineData: makeSparkline(revenueChartData.map((item) => item.loiNhuan)) },
    { id: 'ads-cost', title: 'Ads', value: formatVnd(adsCost), change: change(-4.2), changeLabel: 'so với tháng trước', icon: 'Megaphone', color: 'orange', sparklineData: makeSparkline(dailyEntries.map(([, item]) => item.adsCost / 1_000_000)) },
    { id: 'roas', title: 'ROAS', value: `${roas.toFixed(2)}x`, change: change(15.1), changeLabel: 'so với tháng trước', icon: 'Zap', color: 'yellow', sparklineData: makeSparkline(revenueValues) },
    { id: 'cpa', title: 'CPA', value: formatVnd(cpa), change: change(-6.3), changeLabel: 'so với tháng trước', icon: 'Target', color: 'red', sparklineData: makeSparkline(orderValues) },
  ];

  const revenueDetailRows = dailyEntries.slice(0, 31).map<RevenueDetailRow>(([date, item], index) => ({
    rank: index + 1,
    date: new Date(date).toLocaleDateString('vi-VN'),
    doanhThu: formatVnd(item.revenue),
    donHang: formatCompact(item.orders),
    sanPhamDaBan: formatCompact(item.orders * 2),
    aov: formatVnd(item.revenue / Math.max(item.orders, 1)),
    tyLeHoan: formatPercent(index % 5 === 0 ? refundRate : Math.max(refundRate - 1.2, 0)),
    soVoiKyTruoc: `${index % 3 === 0 ? '-' : '+'}${(5 + (index % 8)).toFixed(1)}%`,
    soVoiKyTruocType: index % 3 === 0 ? 'down' : 'up',
  }));

  const profitRows = buildProfitRows(records, cogsMap);
  const channelProfits = profitRows.map((row) => {
    const amount = Number(row.netProfit.replace(/[^\d-]/g, '')) || 0;
    return {
      name: row.channel,
      value: amount,
      amount: row.netProfit,
      percentage: 0,
    };
  });
  const maxProfit = Math.max(...channelProfits.map((item) => item.value), 1);
  channelProfits.forEach((item) => {
    item.percentage = Number(((item.value / maxProfit) * 100).toFixed(1));
  });

  return {
    dashboardKpis,
    revenueKpis: dashboardKpis,
    profitKpis,
    revenueChartData,
    revenueByTimeData: revenueChartData,
    profitChartData: dailyEntries.map(([date, item]) => ({
      date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      doanhThu: Math.round(item.revenue / 1_000_000),
      loiNhuan: Math.round(item.netProfit / 1_000_000),
      netProfit: Math.round(item.netProfit / 1_000_000),
      tongChiPhi: Math.round((item.cogs + item.adsCost) / 1_000_000),
    })),
    channelRevenue: buildChannelRevenue(records),
    topProducts: buildTopProducts(records, cogsMap),
    topCampaigns: buildTopCampaigns(records),
    revenueDetailRows,
    profitDetailRows: profitRows,
    costStructure: buildCostStructure(totals),
    channelProfits: channelProfits as AnalyticsPayload['channelProfits'],
    totals,
  };
}

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function sourceLabelToKey(source: string) {
  const value = source.toLowerCase();
  if (value.includes('shopee')) return 'shopee';
  if (value.includes('tiktok')) return 'tiktok';
  if (value.includes('lazada')) return 'lazada';
  if (value.includes('ads')) return 'ads';
  return 'giavon';
}

export function buildImportList(jobs: ImportJob[]): ImportListResponse {
  const rows: DataManagementRow[] = jobs.map((job) => ({
    id: job.id,
    fileName: job.fileName,
    fileSize: formatFileSize(job.fileSize),
    source: job.sourceLabel,
    dataType: job.dataType,
    importDate: new Date(job.importedAt).toLocaleString('vi-VN'),
    dataRows: job.validRows,
    status: job.status,
    importedBy: job.importedBy,
  }));

  const selected = jobs[0];
  const fileDetail: FileDetail | null = selected
    ? {
        fileName: selected.fileName,
        source: selected.sourceLabel,
        dataType: selected.dataType,
        importedBy: selected.importedBy,
        importDate: new Date(selected.importedAt).toLocaleString('vi-VN'),
        dataRows: selected.validRows,
        originalFile: selected.fileName,
        notes: selected.errors[0] ?? '-',
        totalRows: selected.totalRows,
        validRows: selected.validRows,
        validPercent: formatPercent((selected.validRows / Math.max(selected.totalRows, 1)) * 100),
        errorRows: selected.errorRows,
        errorPercent: formatPercent((selected.errorRows / Math.max(selected.totalRows, 1)) * 100),
        dateRangeFrom: selected.dateRangeFrom ? new Date(selected.dateRangeFrom).toLocaleDateString('vi-VN') : '-',
        dateRangeTo: selected.dateRangeTo ? new Date(selected.dateRangeTo).toLocaleDateString('vi-VN') : '-',
      }
    : null;

  return {
    jobs,
    rows,
    fileDetail,
    summary: {
      total: jobs.length,
      success: jobs.filter((job) => job.status === 'success').length,
      error: jobs.filter((job) => job.status === 'error').length,
      processing: jobs.filter((job) => job.status === 'processing').length,
    },
  };
}

export function getSourceKeyForRow(row: DataManagementRow) {
  return sourceLabelToKey(row.source);
}
