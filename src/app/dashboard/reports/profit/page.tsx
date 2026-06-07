'use client';

import { Calendar, Settings2 } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import ChartCard from '@/components/ui/ChartCard';
import SvgLineChart from '@/components/ui/SvgLineChart';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import {
  profitKpis,
  profitChartData,
  costStructure,
  channelProfits,
  profitDetailRows,
} from '@/lib/mock-data';

const profitColumns = [
  { key: 'rank', label: '#' },
  { key: 'channel', label: 'Kênh' },
  { key: 'doanhThu', label: 'Doanh thu' },
  { key: 'giaVon', label: 'Giá vốn' },
  { key: 'chiPhiAds', label: 'CP Ads' },
  { key: 'phiSan', label: 'Phí sàn' },
  { key: 'vanChuyen', label: 'Vận chuyển' },
  { key: 'chiPhiKhac', label: 'CP khác' },
  { key: 'loiNhuanGop', label: 'LN gộp' },
  { key: 'netProfit', label: 'Net Profit' },
  { key: 'tySuatLN', label: 'Tỷ suất LN' },
];

export default function ProfitReportPage() {
  const analytics = useAnalyticsData();
  const kpis = analytics?.profitKpis ?? profitKpis;
  const chartData = analytics?.profitChartData ?? profitChartData;
  const costs = analytics?.costStructure ?? costStructure;
  const profits = analytics?.channelProfits ?? channelProfits;
  const detailRows = analytics?.profitDetailRows ?? profitDetailRows;
  const costRadius = 64;
  const costCircumference = 2 * Math.PI * costRadius;
  const maxChannelProfit = Math.max(...profits.map((channel) => channel.value), 1);
  const costSegments = costs.map((item, index) => {
    const offset = costs
      .slice(0, index)
      .reduce((sum, current) => sum + (current.percentage / 100) * costCircumference, 0);
    const dash = (item.percentage / 100) * costCircumference;

    return { item, dash, offset };
  });

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo lợi nhuận</h1>
            <p className="text-sm text-gray-500 mt-1">
              Phân tích chi tiết lợi nhuận và cơ cấu chi phí
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
              <Calendar size={16} />
              Tất cả thời gian
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <MetricCard key={kpi.id} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Lợi nhuận theo thời gian">
            <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Doanh thu
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Tổng chi phí
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Net Profit
              </span>
            </div>
            <div className="h-64">
              <SvgLineChart
                data={chartData}
                viewBoxWidth={390}
                series={[
                  { key: 'doanhThu', color: '#22c55e' },
                  { key: 'tongChiPhi', color: '#ef4444', dashed: true },
                  { key: 'netProfit', color: '#3b82f6' },
                ]}
              />
            </div>
          </ChartCard>

          <ChartCard title="Cơ cấu chi phí">
            <div className="flex flex-col items-center">
              <svg className="h-44 w-44" viewBox="0 0 180 180" role="img" aria-hidden="true">
                <circle cx="90" cy="90" r={costRadius} fill="none" stroke="#f3f4f6" strokeWidth="32" />
                {costSegments.map(({ item, dash, offset }) => (
                  <circle
                    key={item.name}
                    cx="90"
                    cy="90"
                    r={costRadius}
                    fill="none"
                    stroke={item.color}
                    strokeDasharray={`${dash} ${costCircumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    strokeWidth="32"
                    transform="rotate(-90 90 90)"
                  />
                ))}
                <circle cx="90" cy="90" r="44" fill="#fff" />
                <text x="90" y="86" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="700">
                  Chi phí
                </text>
                <text x="90" y="105" textAnchor="middle" fill="#64748b" fontSize="12">
                  100%
                </text>
              </svg>
              <div className="w-full mt-3 space-y-2">
                {costs.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Lợi nhuận theo kênh">
            <div className="space-y-4 pt-3">
              {profits.map((item) => {
                const width = `${Math.max((item.value / maxChannelProfit) * 100, 8)}%`;

                return (
                  <div key={item.name} className="grid grid-cols-[86px_minmax(0,1fr)_92px] items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">{item.name}</span>
                    <div className="h-7 rounded-full bg-gray-100">
                      <div
                        className="h-7 rounded-full bg-green-500 shadow-sm shadow-green-200"
                        style={{ width }}
                      />
                    </div>
                    <span className="whitespace-nowrap text-right text-[12.5px] font-semibold text-gray-900">{item.amount}</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Chi tiết lợi nhuận</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {profitColumns.map((col) => (
                    <th key={col.key} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detailRows.map((row) => (
                  <tr key={row.rank} className="hover:bg-gray-50/50">
                    <td className="px-3 py-3 text-gray-400">{row.rank}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{row.channel}</td>
                    <td className="px-3 py-3 text-gray-700">{row.doanhThu}</td>
                    <td className="px-3 py-3 text-red-500">{row.giaVon}</td>
                    <td className="px-3 py-3 text-orange-500">{row.chiPhiAds}</td>
                    <td className="px-3 py-3 text-gray-600">{row.phiSan}</td>
                    <td className="px-3 py-3 text-gray-600">{row.vanChuyen}</td>
                    <td className="px-3 py-3 text-gray-600">{row.chiPhiKhac}</td>
                    <td className="px-3 py-3 text-blue-600 font-medium">{row.loiNhuanGop}</td>
                    <td className="px-3 py-3 text-green-600 font-bold">{row.netProfit}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {row.tySuatLN}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Settings2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                Công thức lợi nhuận đang áp dụng
              </h3>
              <p className="text-sm text-blue-700">
                Net Profit = Doanh thu - Giá vốn (COGS) - Chi phí Ads - Phí sàn - Vận chuyển - Chi phí khác
              </p>
              <a href="/dashboard/settings/kpi" className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline">
                Xem công thức trong Cài đặt →
              </a>
            </div>
          </div>
        </div>
    </div>
  );
}
