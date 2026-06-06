import { Construction } from 'lucide-react';

export default function ShopsSettingsPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-md">
        <Construction size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Quản lý shop / nền tảng</h1>
        <p className="text-sm text-gray-500">
          Đang chờ thiết kế chi tiết từ designer
        </p>
      </div>
    </div>
  );
}
