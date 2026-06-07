export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'yellow';
  sparklineData?: number[];
}

export interface ChartDataPoint {
  date: string;
  doanhThu: number;
  loiNhuan: number;
  netProfit?: number;
  tongChiPhi?: number;
}

export interface ChannelRevenue {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TopProduct {
  rank: number;
  name: string;
  revenue: string;
  profit: string;
  netProfit: string;
}

export interface TopCampaign {
  rank: number;
  name: string;
  adsCost: string;
  revenue: string;
  roas: number;
}

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  source: 'shopee' | 'tiktok' | 'lazada' | 'ads' | 'giavon';
  sourceLabel: string;
  date: string;
  size: string;
  records: string;
  status: 'success' | 'error' | 'processing';
}

export interface DataManagementRow {
  id: string;
  fileName: string;
  fileSize: string;
  source: string;
  dataType: string;
  importDate: string;
  dataRows: number;
  status: 'success' | 'error' | 'processing';
  importedBy: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  group?: string;
}

export interface RevenueDetailRow {
  rank: number;
  date: string;
  doanhThu: string;
  donHang: string;
  sanPhamDaBan: string;
  aov: string;
  tyLeHoan: string;
  soVoiKyTruoc: string;
  soVoiKyTruocType: 'up' | 'down';
}

export interface ProfitDetailRow {
  rank: number;
  channel: string;
  doanhThu: string;
  giaVon: string;
  chiPhiAds: string;
  phiSan: string;
  vanChuyen: string;
  chiPhiKhac: string;
  loiNhuanGop: string;
  netProfit: string;
  tySuatLN: string;
}

export interface CostStructureItem {
  name: string;
  value: number;
  amount: string;
  percentage: number;
  color: string;
}

export interface ChannelProfit {
  name: string;
  value: number;
  amount: string;
  percentage: number;
}

export interface FileDetail {
  fileName: string;
  source: string;
  dataType: string;
  importedBy: string;
  importDate: string;
  dataRows: number;
  originalFile: string;
  notes: string;
  totalRows: number;
  validRows: number;
  validPercent: string;
  errorRows: number;
  errorPercent: string;
  dateRangeFrom: string;
  dateRangeTo: string;
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}
