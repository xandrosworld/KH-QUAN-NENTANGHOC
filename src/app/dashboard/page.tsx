'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import AnalyticsFilterBar from '@/components/dashboard/AnalyticsFilterBar';
import MetricCard from '@/components/ui/MetricCard';
import SvgLineChart from '@/components/ui/SvgLineChart';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import type { AnalyticsActiveFilters } from '@/lib/data-types';
import type { ChannelRevenue, ChartDataPoint, TopCampaign, TopProduct } from '@/lib/types';

function RevenueChart({ data, cogsAvailable }: { data: ChartDataPoint[]; cogsAvailable: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Doanh thu theo thời gian</h3>
        <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600">
          Theo ngày
        </span>
      </div>
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-500">Doanh thu</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-500">{cogsAvailable ? 'Lợi nhuận' : 'Lợi nhuận trước giá vốn'}</span>
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
  if (data.length === 0) return '#f3f4f6';

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
        <Link href="/dashboard/reports/platforms" className="flex items-center gap-1 text-sm font-semibold text-green-600 transition-colors hover:text-green-700">
          Xem thêm
          <ChevronRight size={16} />
        </Link>
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

function TopProductsTable({ products, cogsAvailable }: { products: TopProduct[]; cogsAvailable: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Top Sản Phẩm ({cogsAvailable ? 'Theo lợi nhuận' : 'Trước giá vốn'})</h3>
        <Link href="/dashboard/reports/products" className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
          Xem thêm
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-3 py-3 text-left font-semibold rounded-l-lg">#</th>
              <th className="px-3 py-3 text-left font-semibold">Sản Phẩm</th>
              <th className="px-3 py-3 text-right font-semibold">Doanh Thu</th>
              <th className="px-3 py-3 text-right font-semibold">{cogsAvailable ? 'Lợi Nhuận' : 'Lãi trước giá vốn'}</th>
              <th className="px-3 py-3 text-right font-semibold rounded-r-lg">{cogsAvailable ? 'Net Profit' : 'Biên trước giá vốn'}</th>
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
        <Link href="/dashboard/reports/campaigns" className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
          Xem thêm
          <ChevronRight size={16} />
        </Link>
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
  const [filters, setFilters] = useState<AnalyticsActiveFilters>({});
  const analytics = useAnalyticsData(filters);
  const [accountName, setAccountName] = useState('');
  const kpis = analytics.dashboardKpis;
  const chartData = analytics.revenueChartData;
  const channelData = analytics.channelRevenue;
  const productRows = analytics.topProducts;
  const campaignRows = analytics.topCampaigns;
  const totalRevenue = analytics.totals.revenue;

  useEffect(() => {
    let mounted = true;
    fetch('/api/account')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted || !payload?.profile?.name) return;
        setAccountName(payload.profile.name);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const profile = (event as CustomEvent<{ name?: string }>).detail;
      if (profile?.name) setAccountName(profile.name);
    };

    window.addEventListener('tronx-profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('tronx-profile-updated', handleProfileUpdated);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng trở lại{accountName ? `, ${accountName}` : ''}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan tình hình kinh doanh của bạn
          </p>
        </div>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        options={analytics.availableFilters}
        recordCount={analytics.recordCount}
        onChange={setFilters}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <MetricCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RevenueChart data={chartData} cogsAvailable={analytics.dataQuality.cogsAvailable} />
        <ChannelDonut data={channelData} total={totalRevenue} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopProductsTable products={productRows} cogsAvailable={analytics.dataQuality.cogsAvailable} />
        <TopCampaignsTable campaigns={campaignRows} />
      </div>
    </div>
  );
}
