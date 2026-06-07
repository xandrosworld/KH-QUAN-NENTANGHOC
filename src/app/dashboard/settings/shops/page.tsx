import { CheckCircle2, Clock, Store } from "lucide-react";

const sources = [
  { name: "Shopee", mode: "Import file", status: "Sẵn sàng Phase 1", ready: true },
  { name: "TikTok Shop", mode: "Import file", status: "Sẵn sàng Phase 1", ready: true },
  { name: "Ads", mode: "Import file chi phí", status: "Sẵn sàng Phase 1", ready: true },
  { name: "Giá vốn", mode: "Template nội bộ", status: "Sẵn sàng Phase 1", ready: true },
  { name: "Lazada/API realtime", mode: "Connector API", status: "Phase sau", ready: false },
];

export default function ShopsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý shop / nền tảng</h1>
        <p className="mt-1 text-sm text-gray-500">Theo dõi nguồn dữ liệu đang dùng trong Phase 1 và phần API connector cho phase sau.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => {
          const Icon = source.ready ? CheckCircle2 : Clock;
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
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  source.ready ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                }`}>
                  <Icon size={13} />
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
