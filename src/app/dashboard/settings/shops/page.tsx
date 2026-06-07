import { CheckCircle2, Store } from "lucide-react";

const sources = [
  { name: "Shopee", mode: "Import file đơn hàng", status: "Đang sử dụng" },
  { name: "TikTok Shop", mode: "Import file đơn hàng", status: "Đang sử dụng" },
  { name: "Lazada", mode: "Import file đơn hàng", status: "Đang sử dụng" },
  { name: "Ads", mode: "Import file chi phí", status: "Đang sử dụng" },
  { name: "Giá vốn", mode: "Import bảng giá vốn", status: "Đang sử dụng" },
];

export default function ShopsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý shop / nền tảng</h1>
        <p className="mt-1 text-sm text-gray-500">Theo dõi các nguồn dữ liệu đang kết nối với dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => {
          return (
            <div key={source.name} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Store size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-950">{source.name}</h2>
                    <p className="text-sm text-gray-500">{source.mode}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                  <CheckCircle2 size={13} />
                  {source.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
