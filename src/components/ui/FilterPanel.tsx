'use client';

import { X, Calendar, ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8">
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function FilterPanel({ visible, onClose }: FilterPanelProps) {
  if (!visible) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col h-full overflow-y-auto shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">Bộ lọc báo cáo</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <button onClick={onClose} className="text-sm text-green-600 hover:text-green-700 font-medium mb-6 self-end -mt-4">
        Xóa bộ lọc
      </button>

      <div className="space-y-5 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Khoảng thời gian</label>
          <div className="relative">
            <input
              type="text"
              placeholder="01/05/2025 - 31/05/2025"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
              readOnly
            />
            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <SelectField label="So sánh với" options={['Tháng trước', 'Cùng kỳ năm trước', 'Tuần trước']} />
        <SelectField label="Kênh bán hàng" options={['Tất cả kênh', 'Shopee', 'TikTok Shop', 'Lazada']} />
        <SelectField label="Shop" options={['Tất cả shop', 'Shop chính', 'Shop phụ 1', 'Shop phụ 2']} />
        <SelectField label="Danh mục sản phẩm" options={['Tất cả danh mục', 'Skincare', 'Makeup', 'Haircare']} />
      </div>

      <button className="w-full mt-6 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition-colors">
        Áp dụng bộ lọc
      </button>
    </div>
  );
}
