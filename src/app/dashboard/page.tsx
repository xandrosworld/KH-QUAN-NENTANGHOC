'use client';

import { Calendar, ChevronRight, BarChart3, Camera, Download, ChevronDown } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import SvgLineChart from '@/components/ui/SvgLineChart';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import {
  dashboardKpis,
  revenueChartData,
  channelRevenue,
  topProducts,
  topCampaigns,
} from '@/lib/mock-data';
import type { ChannelRevenue, ChartDataPoint, TopCampaign, TopProduct } from '@/lib/types';

function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Doanh thu theo thời gian</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Theo ngày
            <ChevronDown size={14} />
          </button>
          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <BarChart3 size={16} />
          </button>
          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <Camera size={16} />
          </button>
          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-500">Tháng này</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-500">Tháng trước</span>
        </div>
      </div>
      <div className="h-60">
        <SvgLineChart
          data={data}
          series={[
            { key: 'doanhThu', color: '#16a34a' },
            { key: 'loiNhuan', color: '#3b82f6' },
          ]}
        />
      </div>
    </div>
  );
}

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

function ChannelDonut({ data, total }: { data: ChannelRevenue[]; total: number }) {
  const legendColumns = { gridTemplateColumns: 'minmax(80px, 1fr) 40px 142px' };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-950">Doanh thu theo kênh</h3>
        <button className="flex items-center gap-1 text-sm font-semibold text-green-600 transition-colors hover:text-green-700">
          Xem thêm
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="relative flex-none rounded-full"
          style={{ width: 156, height: 156, background: getDonutGradient(data), transform: 'rotate(-90deg)' }}
        >
          <div
            className="absolute rounded-full bg-white"
            style={{ inset: 44 }}
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
            {data.map((ch) => (
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
                <span className="min-w-0 whitespace-nowrap text-right text-[12.5px] font-semibold text-gray-950">
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
            <span className="min-w-0 whitespace-nowrap text-right text-[14px] font-extrabold text-gray-950">
              {formatVnd(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopProductsTable({ products }: { products: TopProduct[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Top Sản Phẩm (Theo lợi nhuận)</h3>
        <button className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
          Xem thêm
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-3 py-3 text-left font-semibold rounded-l-lg">#</th>
              <th className="px-3 py-3 text-left font-semibold">Sản Phẩm</th>
              <th className="px-3 py-3 text-right font-semibold">Doanh Thu</th>
              <th className="px-3 py-3 text-right font-semibold">Lợi Nhuận</th>
              <th className="px-3 py-3 text-right font-semibold rounded-r-lg">Net Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.rank} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-3 text-gray-400 font-medium">{p.rank}</td>
                <td className="px-3 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-3 py-3 text-right text-gray-600">{p.revenue}</td>
                <td className="px-3 py-3 text-right text-gray-600">{p.profit}</td>
                <td className="px-3 py-3 text-right font-medium text-gray-900">{p.netProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopCampaignsTable({ campaigns }: { campaigns: TopCampaign[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Top campaign (Theo ROAS)</h3>
        <button className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
          Xem thêm
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-3 py-3 text-left font-semibold rounded-l-lg">#</th>
              <th className="px-3 py-3 text-left font-semibold">Campaign</th>
              <th className="px-3 py-3 text-right font-semibold">Chi phí Ads</th>
              <th className="px-3 py-3 text-right font-semibold">Doanh thu</th>
              <th className="px-3 py-3 text-right font-semibold rounded-r-lg">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.map((c) => (
              <tr key={c.rank} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-3 text-gray-400 font-medium">{c.rank}</td>
                <td className="px-3 py-3 font-medium text-gray-800">{c.name}</td>
                <td className="px-3 py-3 text-right text-gray-600">{c.adsCost}</td>
                <td className="px-3 py-3 text-right text-gray-600">{c.revenue}</td>
                <td className="px-3 py-3 text-right font-semibold text-gray-900">{c.roas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const analytics = useAnalyticsData();
  const kpis = analytics?.dashboardKpis ?? dashboardKpis;
  const chartData = analytics?.revenueChartData ?? revenueChartData;
  const channelData = analytics?.channelRevenue ?? channelRevenue;
  const productRows = analytics?.topProducts ?? topProducts;
  const campaignRows = analytics?.topCampaigns ?? topCampaigns;
  const totalRevenue = analytics?.totals.revenue ?? channelRevenue.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng trở lại, Nguyễn Văn A! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan tình hình kinh doanh của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <span>01/06/2026 - 30/06/2026</span>
            <Calendar size={16} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            So sánh: Tháng trước
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <MetricCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RevenueChart data={chartData} />
        <ChannelDonut data={channelData} total={totalRevenue} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopProductsTable products={productRows} />
        <TopCampaignsTable campaigns={campaignRows} />
      </div>
    </div>
  );
}
