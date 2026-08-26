"use client";

import { Calculator, CheckCircle2, Info } from "lucide-react";

const formulas = [
  ["Doanh thu", "Tổng giá trị đơn thành công"],
  ["Phí sàn", "Shopee/TikTok thu"],
  ["Hoàn/Hủy", "Tổng đơn hoàn + hủy"],
  ["Giá vốn", "Số lượng bán × giá vốn"],
  ["Ads", "Tổng chi phí quảng cáo"],
  ["Gross Profit", "Doanh thu - Giá vốn"],
  ["Net Profit", "Doanh thu - Giá vốn - Ads - Phí sàn - Hoàn/Hủy"],
  ["Margin", "Net Profit / Doanh thu × 100"],
  ["ROAS", "Doanh thu / Chi phí Ads"],
  ["CPA", "Chi phí Ads / Số đơn"],
];

export default function KpiSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt công thức / KPI</h1>
        <p className="mt-1 text-sm text-gray-500">Cấu hình bộ chỉ số đang áp dụng cho dashboard.</p>
      </div>

      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <div className="flex gap-3">
          <Info size={20} className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <h2 className="text-sm font-semibold text-green-800">Trạng thái triển khai</h2>
            <p className="mt-1 text-sm text-green-700">
              Bộ công thức đang được áp dụng cho dữ liệu đã import và tự động cập nhật trên dashboard. Bộ dữ liệu hiện tại chưa có giá vốn theo SKU, vì vậy hệ thống hiển thị lợi nhuận trước giá vốn và chưa công bố Net Profit đầy đủ.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Calculator size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-950">Bộ KPI đang áp dụng</h2>
            <p className="text-sm text-gray-500">Áp dụng cho dashboard doanh thu, lợi nhuận, sản phẩm và campaign.</p>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {formulas.map(([name, formula]) => (
            <div key={name} className="grid grid-cols-[220px_minmax(0,1fr)_110px] items-center gap-4 px-5 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="font-semibold text-gray-900">{name}</span>
              </div>
              <p className="text-sm text-gray-600">{formula}</p>
              <span className="rounded-full bg-green-50 px-3 py-1 text-center text-xs font-semibold text-green-600">
                Đang áp dụng
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
