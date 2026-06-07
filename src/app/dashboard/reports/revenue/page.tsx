'use client';

import { useState } from 'react';
import { Calendar, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import ChartCard from '@/components/ui/ChartCard';
import FilterPanel from '@/components/ui/FilterPanel';
import SvgLineChart from '@/components/ui/SvgLineChart';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import {
  revenueKpis,
  revenueByTimeData,
  channelRevenue,
  revenueDetailRows,
} from '@/lib/mock-data';
import type { ChannelRevenue } from '@/lib/types';

const subTabs = ['Tổng quan', 'Theo thời gian', 'Theo kênh', 'Theo shop', 'Theo sản phẩm', 'Theo danh mục'];

const columns = [
  { key: 'rank', label: '#', align: 'center' as const },
  { key: 'date', label: 'Ngày' },
  { key: 'doanhThu', label: 'Doanh thu', align: 'right' as const },
  { key: 'donHang', label: 'Đơn hàng', align: 'right' as const },
  { key: 'sanPhamDaBan', label: 'SP đã bán', align: 'right' as const },
  { key: 'aov', label: 'AOV', align: 'right' as const },
  { key: 'tyLeHoan', label: 'Tỷ lệ hoàn', align: 'right' as const },
  { key: 'soVoiKyTruoc', label: 'So với kỳ trước', align: 'right' as const },
];

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`;
}

function getDonutGradient(data: ChannelRevenue[]) {
  let cursor = 0;

  return `conic-gradient(${data
    .map((item) => {
      const start = cursor;
      const end = cursor + item.percentage * 3.6;
      cursor = end;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(', ')})`;
}

export default function RevenueReportPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);
  const analytics = useAnalyticsData();
  const kpis = analytics?.revenueKpis ?? revenueKpis;
  const timeData = analytics?.revenueByTimeData ?? revenueByTimeData;
  const channelData = analytics?.channelRevenue ?? channelRevenue;
  const detailRows = analytics?.revenueDetailRows ?? revenueDetailRows;
  const total = analytics?.totals.revenue ?? channelRevenue.reduce((sum, item) => sum + item.value, 0);
  const legendColumns = { gridTemplateColumns: 'minmax(90px, 1fr) 42px 142px' };

  return (
    <div className="flex h-full">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo doanh thu</h1>
            <p className="text-sm text-gray-500 mt-1">Phân tích chi tiết doanh thu theo thời gian, kênh bán hàng</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Calendar size={16} />
              01/05/2025 - 31/05/2025
            </button>
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterVisible ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {subTabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === idx ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpis.map((kpi) => (
            <MetricCard key={kpi.id} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Doanh thu theo thời gian">
            <div className="h-72">
              <SvgLineChart
                data={timeData}
                series={[
                  { key: 'doanhThu', color: '#22c55e' },
                  { key: 'loiNhuan', color: '#94a3b8', dashed: true },
                ]}
              />
            </div>
          </ChartCard>

          <ChartCard title="Doanh thu theo kênh">
            <div className="flex items-center gap-5">
              <div
                className="relative mx-auto flex-none rounded-full"
                style={{ width: 176, height: 176, background: getDonutGradient(channelData), transform: 'rotate(-90deg)' }}
              >
                <div
                  className="absolute rounded-full bg-white"
                  style={{ inset: 50 }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="mb-2 grid gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400"
                  style={legendColumns}
                >
                  <span>Kênh</span>
                  <span className="text-right">%</span>
                  <span className="text-right">Doanh thu</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {channelData.map((ch) => (
                    <div
                      key={ch.name}
                      className="grid items-center gap-2 py-3 text-sm"
                      style={legendColumns}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 flex-none rounded-[3px]"
                          style={{ backgroundColor: ch.color }}
                        />
                        <span className="truncate font-medium text-gray-800">{ch.name}</span>
                      </div>
                      <span className="text-right text-gray-500">{ch.percentage}%</span>
                      <span className="whitespace-nowrap text-right text-[12.5px] font-semibold text-gray-950">
                        {formatVnd(ch.value)}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-3 grid items-center gap-2 border-t border-gray-200 px-1 pt-4"
                  style={legendColumns}
                >
                  <span className="text-sm font-extrabold uppercase text-gray-950">Tổng</span>
                  <span />
                  <span className="whitespace-nowrap text-right text-[14px] font-extrabold text-gray-950">
                    {formatVnd(total)}
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Chi tiết doanh thu</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detailRows.map((row) => (
                  <tr key={row.rank} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-center text-gray-400">{row.rank}</td>
                    <td className="px-4 py-3 text-gray-700">{row.date}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{row.doanhThu}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.donHang}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.sanPhamDaBan}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.aov}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.tyLeHoan}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        row.soVoiKyTruocType === 'up' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {row.soVoiKyTruocType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {row.soVoiKyTruoc}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-sm text-gray-500">Hiển thị 1-8 của 31 kết quả</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === 1 ? 'bg-green-600 text-white' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FilterPanel visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </div>
  );
}
