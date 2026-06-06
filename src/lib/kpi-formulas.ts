export type KpiFormulaStatus = "core-confirmed" | "needs-data-mapping";

export interface KpiFormulaDefinition {
  id: string;
  name: string;
  formula: string;
  status: KpiFormulaStatus;
  note?: string;
}

export const kpiFormulas: KpiFormulaDefinition[] = [
  {
    id: "revenue",
    name: "Doanh thu",
    formula: "Tổng giá trị đơn thành công",
    status: "needs-data-mapping",
    note: "Cần map trạng thái đơn thành công từ file Shopee/TikTok Shop.",
  },
  {
    id: "platform-fee",
    name: "Phí sàn",
    formula: "Shopee/TikTok thu",
    status: "needs-data-mapping",
    note: "Cần xác định các cột phí sàn/phí giao dịch/phí thanh toán trong file export.",
  },
  {
    id: "refund-cancel",
    name: "Hoàn/Hủy",
    formula: "Tổng đơn hoàn + hủy",
    status: "needs-data-mapping",
    note: "Cần thống nhất tính theo số đơn hay giá trị tiền hoàn/hủy cho từng báo cáo.",
  },
  {
    id: "cogs",
    name: "Giá vốn",
    formula: "Số lượng bán x giá vốn",
    status: "needs-data-mapping",
    note: "Cần file giá vốn/SKU và quy tắc xử lý giá vốn thay đổi theo thời gian.",
  },
  {
    id: "ads",
    name: "Ads",
    formula: "Tổng chi phí quảng cáo",
    status: "needs-data-mapping",
    note: "Cần map nguồn Ads: Facebook, TikTok, Google hoặc tổng hợp.",
  },
  {
    id: "gross-profit",
    name: "Gross Profit",
    formula: "Doanh thu - Giá vốn",
    status: "core-confirmed",
  },
  {
    id: "net-profit",
    name: "Net Profit",
    formula: "Doanh thu - Giá vốn - Ads - Phí sàn - Hoàn/Hủy",
    status: "core-confirmed",
  },
  {
    id: "margin",
    name: "Margin",
    formula: "Net Profit / Doanh thu x 100",
    status: "core-confirmed",
    note: "Cần xử lý trường hợp doanh thu bằng 0.",
  },
  {
    id: "roas",
    name: "ROAS",
    formula: "Doanh thu / Chi phí Ads",
    status: "core-confirmed",
    note: "Cần xử lý trường hợp chi phí Ads bằng 0.",
  },
  {
    id: "cpa",
    name: "CPA",
    formula: "Chi phí Ads / Số đơn",
    status: "core-confirmed",
    note: "Cần thống nhất số đơn là đơn thành công hay tổng đơn phát sinh.",
  },
];
