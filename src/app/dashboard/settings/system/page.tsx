import { Database, Server, ShieldCheck, Sparkles } from "lucide-react";

const settings = [
  { label: "Ứng dụng", value: "TronX AI Dashboard", icon: Sparkles },
  { label: "Môi trường", value: "Sẵn sàng vận hành", icon: Server },
  { label: "Dữ liệu", value: "Import Excel/CSV và lưu lịch sử xử lý", icon: Database },
  { label: "Bảo mật", value: "Tài khoản quản trị và phiên đăng nhập bảo mật", icon: ShieldCheck },
];

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">Thông tin vận hành và cấu hình nền tảng.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-1 font-semibold text-gray-950">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
