"use client";

import { Globe, TrendingUp } from "lucide-react";
import { useState } from "react";
import AnalyticsFilterBar from "@/components/dashboard/AnalyticsFilterBar";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { channelRevenue } from "@/lib/mock-data";
import type { AnalyticsActiveFilters } from "@/lib/data-types";

export default function PlatformsReportPage() {
  const [filters, setFilters] = useState<AnalyticsActiveFilters>({});
  const analytics = useAnalyticsData(filters);
  const channels = analytics?.channelRevenue ?? channelRevenue;
  const total = analytics?.totals.revenue ?? channels.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo theo nền tảng</h1>
        <p className="mt-1 text-sm text-gray-500">So sánh doanh thu và tỷ trọng giữa các kênh bán hàng.</p>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        options={analytics?.availableFilters}
        recordCount={analytics?.recordCount}
        onChange={setFilters}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {channels.map((channel) => (
          <div key={channel.name} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{channel.name}</p>
                  <p className="text-xs text-gray-500">{channel.percentage}% tổng doanh thu</p>
                </div>
              </div>
              <TrendingUp size={18} className="text-green-500" />
            </div>
            <p className="mt-5 text-xl font-bold text-gray-950">{channel.value.toLocaleString("vi-VN")} đ</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(channel.percentage, 100)}%`, backgroundColor: channel.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-950">Cơ cấu doanh thu theo nền tảng</h2>
        <div className="mt-5 space-y-4">
          {channels.map((channel) => (
            <div key={channel.name} className="grid grid-cols-[140px_minmax(0,1fr)_150px_60px] items-center gap-4 text-sm">
              <span className="font-medium text-gray-700">{channel.name}</span>
              <div className="h-8 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="flex h-full items-center justify-end rounded-full pr-3 text-xs font-semibold text-white"
                  style={{ width: `${Math.max(channel.percentage, 8)}%`, backgroundColor: channel.color }}
                >
                  {channel.percentage}%
                </div>
              </div>
              <span className="text-right font-semibold text-gray-900">{channel.value.toLocaleString("vi-VN")} đ</span>
              <span className="text-right text-gray-500">{((channel.value / Math.max(total, 1)) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
