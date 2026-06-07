import Link from "next/link";
import { Bot, Database, FileSpreadsheet, LifeBuoy, MessageCircle, UploadCloud } from "lucide-react";

const quickGuides = [
  {
    title: "Import dữ liệu",
    description: "Chọn nguồn dữ liệu, tải file mẫu nếu cần, sau đó upload file Excel/CSV để hệ thống chuẩn hóa dữ liệu.",
    href: "/dashboard/import",
    icon: UploadCloud,
  },
  {
    title: "Quản lý dữ liệu",
    description: "Xem lịch sử import, kiểm tra số dòng hợp lệ/lỗi, tải lại dữ liệu đã import hoặc xóa lượt import sai.",
    href: "/dashboard/data-management",
    icon: Database,
  },
  {
    title: "Báo cáo",
    description: "Dùng bộ lọc thời gian, sàn, sản phẩm hoặc campaign để xem lại doanh thu, lợi nhuận và hiệu quả quảng cáo.",
    href: "/dashboard/reports/revenue",
    icon: FileSpreadsheet,
  },
  {
    title: "AI Chatbot",
    description: "Hỏi nhanh về doanh thu, net profit, ROAS, hoàn/hủy, top sản phẩm hoặc top campaign theo dữ liệu đang có.",
    href: "/dashboard",
    icon: Bot,
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hướng dẫn sử dụng</h1>
        <p className="mt-1 text-sm text-gray-500">Các thao tác vận hành chính trong TronX AI Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {quickGuides.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-green-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon size={22} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-green-100 bg-green-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white text-green-600">
            <LifeBuoy size={22} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-950">Cần hỗ trợ thêm?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Gửi file mẫu hoặc mô tả lỗi import cho đội triển khai để được kiểm tra mapping, công thức KPI và dữ liệu báo cáo.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-green-700">
              <MessageCircle size={16} />
              Kênh hỗ trợ dự án
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
