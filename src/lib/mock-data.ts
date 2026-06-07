import type {
  KpiMetric,
  ChartDataPoint,
  ChannelRevenue,
  TopProduct,
  TopCampaign,
  ImportHistoryItem,
  DataManagementRow,
  MenuItem,
  RevenueDetailRow,
  ProfitDetailRow,
  CostStructureItem,
  ChannelProfit,
  FileDetail,
} from './types';

export const menuItems: MenuItem[] = [
  { id: 'dashboard', icon: 'LayoutDashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'import', icon: 'Upload', label: 'Import dữ liệu', href: '/dashboard/import', group: 'IMPORT & DATA' },
  { id: 'data', icon: 'Database', label: 'Quản lý dữ liệu', href: '/dashboard/data-management', group: 'IMPORT & DATA' },
  { id: 'revenue', icon: 'TrendingUp', label: 'Báo cáo doanh thu', href: '/dashboard/reports/revenue', group: 'BÁO CÁO' },
  { id: 'profit', icon: 'DollarSign', label: 'Báo cáo lợi nhuận', href: '/dashboard/reports/profit', group: 'BÁO CÁO' },
  { id: 'products', icon: 'Package', label: 'Báo cáo sản phẩm', href: '/dashboard/reports/products', group: 'BÁO CÁO' },
  { id: 'campaigns', icon: 'Megaphone', label: 'Báo cáo campaign', href: '/dashboard/reports/campaigns', group: 'BÁO CÁO' },
  { id: 'platforms', icon: 'Globe', label: 'Báo cáo theo nền tảng', href: '/dashboard/reports/platforms', group: 'BÁO CÁO' },
  { id: 'kpi', icon: 'Settings2', label: 'Cài đặt công thức / KPI', href: '/dashboard/settings/kpi', group: 'CÀI ĐẶT' },
  { id: 'shops', icon: 'Store', label: 'Quản lý shop / nền tảng', href: '/dashboard/settings/shops', group: 'CÀI ĐẶT' },
  { id: 'system', icon: 'Settings', label: 'Cài đặt hệ thống', href: '/dashboard/settings/system', group: 'CÀI ĐẶT' },
];

export const dashboardKpis: KpiMetric[] = [
  {
    id: 'revenue',
    title: 'Doanh thu',
    value: '1.234.567.891 đ',
    change: 18.5,
    changeLabel: 'so với tháng trước',
    icon: 'TrendingUp',
    color: 'green',
    sparklineData: [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90],
  },
  {
    id: 'orders',
    title: 'Đơn hàng',
    value: '2,3456',
    change: 15.2,
    changeLabel: 'so với tháng trước',
    icon: 'ShoppingCart',
    color: 'yellow',
    sparklineData: [20, 35, 30, 45, 40, 55, 50, 60, 58, 65, 62, 70],
  },
  {
    id: 'ads-cost',
    title: 'AOV',
    value: '99,230 đ',
    change: -7.8,
    changeLabel: 'so với tháng trước',
    icon: 'CreditCard',
    color: 'orange',
    sparklineData: [50, 45, 55, 40, 48, 42, 46, 38, 44, 40, 42, 38],
  },
  {
    id: 'profit-loss',
    title: 'Sản phẩm đã bán',
    value: '812.345.000 đ',
    change: 7.8,
    changeLabel: 'so với tháng trước',
    icon: 'ArrowUpDown',
    color: 'blue',
    sparklineData: [25, 30, 35, 32, 38, 42, 40, 45, 48, 50, 52, 55],
  },
  {
    id: 'net-profit',
    title: 'Tỷ lệ hoàn hàng',
    value: '16,8%',
    change: 2.6,
    changeLabel: 'so với tháng trước',
    icon: 'Wallet',
    color: 'red',
    sparklineData: [22, 24, 23, 25, 26, 24, 27, 26, 28, 27, 29, 28],
  },
];

export const revenueChartData: ChartDataPoint[] = [
  { date: '01/06', doanhThu: 128, loiNhuan: 42 },
  { date: '03/06', doanhThu: 156, loiNhuan: 48 },
  { date: '05/06', doanhThu: 172, loiNhuan: 56 },
  { date: '08/06', doanhThu: 145, loiNhuan: 50 },
  { date: '10/06', doanhThu: 218, loiNhuan: 68 },
  { date: '12/06', doanhThu: 244, loiNhuan: 74 },
  { date: '15/06', doanhThu: 318, loiNhuan: 108 },
  { date: '17/06', doanhThu: 204, loiNhuan: 62 },
  { date: '20/06', doanhThu: 274, loiNhuan: 78 },
  { date: '22/06', doanhThu: 306, loiNhuan: 96 },
  { date: '25/06', doanhThu: 238, loiNhuan: 72 },
  { date: '27/06', doanhThu: 282, loiNhuan: 86 },
  { date: '30/06', doanhThu: 348, loiNhuan: 118 },
];

export const revenueByTimeData: ChartDataPoint[] = [
  { date: '01/05', doanhThu: 42, loiNhuan: 38 },
  { date: '05/05', doanhThu: 48, loiNhuan: 42 },
  { date: '10/05', doanhThu: 55, loiNhuan: 45 },
  { date: '15/05', doanhThu: 52, loiNhuan: 48 },
  { date: '20/05', doanhThu: 60, loiNhuan: 50 },
  { date: '25/05', doanhThu: 58, loiNhuan: 52 },
  { date: '30/05', doanhThu: 65, loiNhuan: 55 },
];

export const channelRevenue: ChannelRevenue[] = [
  { name: 'Shopee', value: 721450000, percentage: 58.4, color: '#EE4D2D' },
  { name: 'TikTok Shop', value: 354280000, percentage: 28.7, color: '#000000' },
  { name: 'Lazada', value: 93450000, percentage: 7.6, color: '#F59E0B' },
  { name: 'Khác', value: 66490000, percentage: 5.3, color: '#3B82F6' },
];

export const topProducts: TopProduct[] = [
  { rank: 1, name: 'Áo thun nam cotton', revenue: '245.670.000 đ', profit: '67.450.000 đ', netProfit: '27,45%' },
  { rank: 2, name: 'Quần short nam', revenue: '198.450.000 đ', profit: '54.230.000 đ', netProfit: '27,35%' },
  { rank: 3, name: 'Áo hoodie nam', revenue: '175.230.000 đ', profit: '38.450.000 đ', netProfit: '21,94%' },
  { rank: 4, name: 'Dép slide nam', revenue: '124.560.000 đ', profit: '22.150.000 đ', netProfit: '17,79%' },
  { rank: 5, name: 'Tất cổ cao nam', revenue: '98.760.000 đ', profit: '15.340.000 đ', netProfit: '15,53%' },
];

export const topCampaigns: TopCampaign[] = [
  { rank: 1, name: 'Tiktok - Sale 6.6', adsCost: '32.450.000 đ', revenue: '245.670.000 đ', roas: 7.57 },
  { rank: 2, name: 'Shopee - 6.6 Brand Day', adsCost: '28.760.000 đ', revenue: '198.450.000 đ', roas: 6.90 },
  { rank: 3, name: 'Tiktok - New Collection', adsCost: '25.340.000 đ', revenue: '156.780.000 đ', roas: 6.18 },
  { rank: 4, name: 'Shopee - Off 15%', adsCost: '18.450.000 đ', revenue: '112.340.000 đ', roas: 6.09 },
  { rank: 5, name: 'Tiktok - Remarketing', adsCost: '15.230.000 đ', revenue: '86.450.000 đ', roas: 5.68 },
];

export const importHistory: ImportHistoryItem[] = [
  { id: '1', fileName: 'Shopee_Orders_Jun2026.xlsx', source: 'shopee', sourceLabel: 'Shopee Orders', date: '30/06/2026 10:30', size: '98.6 MB', records: '1,245 đơn hàng', status: 'success' },
  { id: '2', fileName: 'TikTok_Shop_Jun2026.xlsx', source: 'tiktok', sourceLabel: 'TikTok Shop', date: '30/06/2026 09:15', size: '76.4 MB', records: '876 đơn hàng', status: 'success' },
  { id: '3', fileName: 'Ads_Facebook_Jun2026.csv', source: 'ads', sourceLabel: 'Facebook Ads', date: '29/06/2026 16:45', size: '12.7 MB', records: '32 campaign', status: 'processing' },
  { id: '4', fileName: 'GiaVon_SanPham_Jun2026.xlsx', source: 'giavon', sourceLabel: 'Giá vốn', date: '29/06/2026 14:20', size: '45.3 MB', records: '1,234 sản phẩm', status: 'success' },
  { id: '5', fileName: 'Shopee_Orders_Jun2026_retry.xlsx', source: 'shopee', sourceLabel: 'Shopee Orders', date: '28/06/2026 10:20', size: '98.6 MB', records: '0 đơn hàng', status: 'error' },
  { id: '6', fileName: 'TikTok_Ads_Jun2026.csv', source: 'ads', sourceLabel: 'TikTok Ads', date: '28/06/2026 15:10', size: '8.9 MB', records: '18 campaign', status: 'success' },
  { id: '7', fileName: 'Shopee_Orders_Jun2026.xlsx', source: 'shopee', sourceLabel: 'Shopee Orders', date: '30/06/2026 10:30', size: '98.6 MB', records: '1,245 đơn hàng', status: 'success' },
];

export const dataManagementRows: DataManagementRow[] = [
  { id: '1', fileName: 'Shopee_Orders_Jun2026.xlsx', fileSize: '1.2 MB', source: 'Shopee', dataType: 'Đơn hàng', importDate: '30/06/2026 10:30', dataRows: 12456, status: 'success', importedBy: 'Nguyễn Văn A' },
  { id: '2', fileName: 'TikTok_Shop_Jun2026.xlsx', fileSize: '764 KB', source: 'TikTok Shop', dataType: 'Đơn hàng', importDate: '30/06/2026 09:15', dataRows: 8732, status: 'success', importedBy: 'Nguyễn Văn A' },
  { id: '3', fileName: 'Ads_Facebook_Jun2026.csv', fileSize: '12.7 MB', source: 'Ads', dataType: 'Chi phí quảng cáo', importDate: '29/06/2026 16:45', dataRows: 32891, status: 'success', importedBy: 'Nguyễn Văn A' },
  { id: '4', fileName: 'GiaVon_SanPham_Jun2026.xlsx', fileSize: '45.3 MB', source: 'Giá vốn', dataType: 'Giá vốn sản phẩm', importDate: '29/06/2026 14:20', dataRows: 1234, status: 'success', importedBy: 'Nguyễn Văn A' },
  { id: '5', fileName: 'Shopee_Orders_Jun2026_retry.xlsx', fileSize: '983 KB', source: 'Shopee', dataType: 'Đơn hàng', importDate: '28/06/2026 10:20', dataRows: 0, status: 'error', importedBy: 'Nguyễn Văn A' },
  { id: '6', fileName: 'TikTok_Ads_Jun2026.csv', fileSize: '8.9 MB', source: 'Ads', dataType: 'Chi phí quảng cáo', importDate: '28/06/2026 15:10', dataRows: 18235, status: 'success', importedBy: 'Nguyễn Văn A' },
  { id: '7', fileName: 'Ads_Google_Jun2026.csv', fileSize: '6.2 MB', source: 'Ads', dataType: 'Chi phí quảng cáo', importDate: '27/06/2026 11:05', dataRows: 15672, status: 'processing', importedBy: 'Nguyễn Văn A' },
  { id: '8', fileName: 'Shopee_Orders_Jun2026_update.xlsx', fileSize: '765 KB', source: 'Shopee', dataType: 'Đơn hàng', importDate: '26/06/2026 09:30', dataRows: 11243, status: 'error', importedBy: 'Nguyễn Văn A' },
  { id: '9', fileName: 'GiaVon_SanPham_Jun2026.xlsx', fileSize: '32.1 MB', source: 'Giá vốn', dataType: 'Giá vốn sản phẩm', importDate: '25/06/2026 17:45', dataRows: 1189, status: 'success', importedBy: 'Nguyễn Văn A' },
  { id: '10', fileName: 'TikTok_Shop_Jun2026.xlsx', fileSize: '658 MB', source: 'TikTok Shop', dataType: 'Đơn hàng', importDate: '24/06/2026 16:20', dataRows: 7891, status: 'success', importedBy: 'Nguyễn Văn A' },
];

export const revenueKpis: KpiMetric[] = [
  { id: 'revenue', title: 'Doanh thu', value: '1.234.567.891 đ', change: 18.5, changeLabel: 'so với tháng trước', icon: 'Wallet', color: 'green', sparklineData: [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90] },
  { id: 'orders', title: 'Đơn hàng', value: '2,3456', change: 15.2, changeLabel: 'so với tháng trước', icon: 'ShoppingBag', color: 'purple', sparklineData: [20, 35, 30, 45, 40, 55, 50, 60, 58, 65, 62, 70] },
  { id: 'aov', title: 'AOV', value: '99,230 đ', change: -7.8, changeLabel: 'so với tháng trước', icon: 'CreditCard', color: 'orange', sparklineData: [50, 45, 55, 40, 48, 42, 46, 38, 44, 40, 42, 38] },
  { id: 'sold-products', title: 'Sản phẩm đã bán', value: '812.345.000 đ', change: 7.8, changeLabel: 'so với tháng trước', icon: 'ArrowUpDown', color: 'blue', sparklineData: [25, 30, 35, 32, 38, 42, 40, 45, 48, 50, 52, 55] },
  { id: 'refund-rate', title: 'Tỷ lệ hoàn hàng', value: '16,8%', change: 2.6, changeLabel: 'so với tháng trước', icon: 'Wallet', color: 'red', sparklineData: [22, 24, 23, 25, 26, 24, 27, 26, 28, 27, 29, 28] },
];

export const profitKpis: KpiMetric[] = [
  { id: 'gross-profit', title: 'Lợi nhuận gộp', value: '456,789,000đ', change: 8.3, changeLabel: 'so với tháng trước', icon: 'TrendingUp', color: 'green', sparklineData: [30, 35, 32, 38, 36, 42, 40, 45, 43, 48, 46, 50] },
  { id: 'net-profit', title: 'Lợi nhuận ròng', value: '345,678,000đ', change: 12.1, changeLabel: 'so với tháng trước', icon: 'DollarSign', color: 'blue', sparklineData: [20, 25, 22, 28, 26, 32, 30, 35, 33, 38, 36, 40] },
  { id: 'gross-margin', title: 'Biên LN gộp', value: '37.0%', change: 2.4, changeLabel: 'so với tháng trước', icon: 'Percent', color: 'purple', sparklineData: [32, 33, 34, 33, 35, 36, 35, 37, 36, 38, 37, 38] },
  { id: 'net-margin', title: 'Biên LN ròng', value: '28.0%', change: 1.8, changeLabel: 'so với tháng trước', icon: 'Target', color: 'green', sparklineData: [22, 23, 24, 23, 25, 26, 25, 27, 26, 28, 27, 28] },
  { id: 'total-cost', title: 'Tổng chi phí', value: '888,889,890đ', change: -4.2, changeLabel: 'so với tháng trước', icon: 'Wallet', color: 'orange', sparklineData: [80, 78, 82, 76, 79, 74, 77, 72, 75, 70, 73, 68] },
  { id: 'roas', title: 'ROAS', value: '4.2x', change: 15.1, changeLabel: 'so với tháng trước', icon: 'Zap', color: 'red', sparklineData: [25, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48] },
];

export const profitChartData: ChartDataPoint[] = [
  { date: 'T1', doanhThu: 850, loiNhuan: 230, netProfit: 180, tongChiPhi: 620 },
  { date: 'T2', doanhThu: 920, loiNhuan: 260, netProfit: 200, tongChiPhi: 660 },
  { date: 'T3', doanhThu: 780, loiNhuan: 210, netProfit: 160, tongChiPhi: 570 },
  { date: 'T4', doanhThu: 1050, loiNhuan: 310, netProfit: 250, tongChiPhi: 740 },
  { date: 'T5', doanhThu: 1200, loiNhuan: 350, netProfit: 280, tongChiPhi: 850 },
  { date: 'T6', doanhThu: 980, loiNhuan: 280, netProfit: 220, tongChiPhi: 700 },
  { date: 'T7', doanhThu: 1100, loiNhuan: 320, netProfit: 260, tongChiPhi: 780 },
  { date: 'T8', doanhThu: 1350, loiNhuan: 400, netProfit: 330, tongChiPhi: 950 },
  { date: 'T9', doanhThu: 1150, loiNhuan: 340, netProfit: 270, tongChiPhi: 810 },
  { date: 'T10', doanhThu: 1280, loiNhuan: 370, netProfit: 300, tongChiPhi: 910 },
  { date: 'T11', doanhThu: 1400, loiNhuan: 410, netProfit: 340, tongChiPhi: 990 },
  { date: 'T12', doanhThu: 1500, loiNhuan: 450, netProfit: 370, tongChiPhi: 1050 },
];

export const costStructure: CostStructureItem[] = [
  { name: 'Giá vốn (COGS)', value: 45, amount: '555,555,000đ', percentage: 45, color: '#EF4444' },
  { name: 'Chi phí Ads', value: 25, amount: '308,641,000đ', percentage: 25, color: '#F97316' },
  { name: 'Phí sàn', value: 15, amount: '185,185,000đ', percentage: 15, color: '#EAB308' },
  { name: 'Vận chuyển', value: 10, amount: '123,457,000đ', percentage: 10, color: '#3B82F6' },
  { name: 'Chi phí khác', value: 5, amount: '61,728,000đ', percentage: 5, color: '#8B5CF6' },
];

export const channelProfits: ChannelProfit[] = [
  { name: 'Shopee', value: 145000000, amount: '145,000,000đ', percentage: 42 },
  { name: 'TikTok Shop', value: 98000000, amount: '98,000,000đ', percentage: 28 },
  { name: 'Lazada', value: 72000000, amount: '72,000,000đ', percentage: 21 },
  { name: 'Khác', value: 30678000, amount: '30,678,000đ', percentage: 9 },
];

export const revenueDetailRows: RevenueDetailRow[] = [
  { rank: 1, date: '01/06/2026', doanhThu: '42,500,000đ', donHang: '156', sanPhamDaBan: '312', aov: '272,436đ', tyLeHoan: '3.2%', soVoiKyTruoc: '+12.5%', soVoiKyTruocType: 'up' },
  { rank: 2, date: '02/06/2026', doanhThu: '38,200,000đ', donHang: '142', sanPhamDaBan: '284', aov: '268,873đ', tyLeHoan: '2.8%', soVoiKyTruoc: '+8.3%', soVoiKyTruocType: 'up' },
  { rank: 3, date: '03/06/2026', doanhThu: '45,100,000đ', donHang: '168', sanPhamDaBan: '336', aov: '268,452đ', tyLeHoan: '4.1%', soVoiKyTruoc: '-3.2%', soVoiKyTruocType: 'down' },
  { rank: 4, date: '04/06/2026', doanhThu: '35,800,000đ', donHang: '130', sanPhamDaBan: '260', aov: '275,385đ', tyLeHoan: '2.5%', soVoiKyTruoc: '+5.7%', soVoiKyTruocType: 'up' },
  { rank: 5, date: '05/06/2026', doanhThu: '51,300,000đ', donHang: '189', sanPhamDaBan: '378', aov: '271,429đ', tyLeHoan: '3.8%', soVoiKyTruoc: '+18.2%', soVoiKyTruocType: 'up' },
  { rank: 6, date: '06/06/2026', doanhThu: '39,600,000đ', donHang: '148', sanPhamDaBan: '296', aov: '267,568đ', tyLeHoan: '3.0%', soVoiKyTruoc: '-1.5%', soVoiKyTruocType: 'down' },
  { rank: 7, date: '07/06/2026', doanhThu: '44,200,000đ', donHang: '162', sanPhamDaBan: '324', aov: '272,840đ', tyLeHoan: '3.5%', soVoiKyTruoc: '+9.1%', soVoiKyTruocType: 'up' },
  { rank: 8, date: '08/06/2026', doanhThu: '47,800,000đ', donHang: '175', sanPhamDaBan: '350', aov: '273,143đ', tyLeHoan: '4.0%', soVoiKyTruoc: '+14.3%', soVoiKyTruocType: 'up' },
];

export const profitDetailRows: ProfitDetailRow[] = [
  { rank: 1, channel: 'Shopee', doanhThu: '520,000,000đ', giaVon: '234,000,000đ', chiPhiAds: '78,000,000đ', phiSan: '41,600,000đ', vanChuyen: '26,000,000đ', chiPhiKhac: '15,400,000đ', loiNhuanGop: '286,000,000đ', netProfit: '125,000,000đ', tySuatLN: '24.0%' },
  { rank: 2, channel: 'TikTok Shop', doanhThu: '380,000,000đ', giaVon: '171,000,000đ', chiPhiAds: '57,000,000đ', phiSan: '22,800,000đ', vanChuyen: '19,000,000đ', chiPhiKhac: '12,200,000đ', loiNhuanGop: '209,000,000đ', netProfit: '98,000,000đ', tySuatLN: '25.8%' },
  { rank: 3, channel: 'Lazada', doanhThu: '230,000,000đ', giaVon: '103,500,000đ', chiPhiAds: '34,500,000đ', phiSan: '16,100,000đ', vanChuyen: '11,500,000đ', chiPhiKhac: '7,400,000đ', loiNhuanGop: '126,500,000đ', netProfit: '57,000,000đ', tySuatLN: '24.8%' },
  { rank: 4, channel: 'Khác', doanhThu: '104,567,890đ', giaVon: '47,056,000đ', chiPhiAds: '15,685,000đ', phiSan: '5,228,000đ', vanChuyen: '5,228,000đ', chiPhiKhac: '3,693,000đ', loiNhuanGop: '57,512,000đ', netProfit: '27,678,000đ', tySuatLN: '26.5%' },
];

export const fileDetail: FileDetail = {
  fileName: 'Shopee_Orders_Jun2026.xlsx',
  source: 'Shopee',
  dataType: 'Đơn hàng',
  importedBy: 'Nguyễn Văn A',
  importDate: '30/06/2026 10:30',
  dataRows: 12456,
  originalFile: 'Shopee_Orders_Jun2026.xlsx',
  notes: '-',
  totalRows: 12456,
  validRows: 12312,
  validPercent: '98.84%',
  errorRows: 144,
  errorPercent: '1.16%',
  dateRangeFrom: '01/06/2026',
  dateRangeTo: '30/06/2026',
};
