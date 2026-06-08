"use client";

import { Megaphone, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import AnalyticsFilterBar from "@/components/dashboard/AnalyticsFilterBar";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import type { AnalyticsActiveFilters } from "@/lib/data-types";

export default function CampaignsReportPage() {
  const [filters, setFilters] = useState<AnalyticsActiveFilters>({});
  const analytics = useAnalyticsData(filters);
  const campaigns = analytics.topCampaigns;
  const adsCost = analytics.totals.adsCost;
  const roas = analytics.totals.roas;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo campaign</h1>
          <p className="mt-1 text-sm text-gray-500">Theo dõi chi phí quảng cáo, doanh thu và ROAS từng campaign.</p>
        </div>
        <div className="relative w-72">
          <input
            value={filters.campaign ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, campaign: event.target.value || undefined }))}
            placeholder="Tìm campaign..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        options={analytics.availableFilters}
        recordCount={analytics.recordCount}
        onChange={setFilters}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Tổng chi phí Ads", value: `${Math.round(adsCost).toLocaleString("vi-VN")} đ`, icon: Megaphone, color: "text-orange-600 bg-orange-50" },
          { label: "ROAS tổng", value: `${roas.toFixed(2)}x`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Campaign tốt nhất", value: campaigns[0]?.name ?? "-", icon: Target, color: "text-blue-600 bg-blue-50" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-gray-950">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-950">Top campaign theo ROAS</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Campaign</th>
                <th className="px-4 py-3 text-right">Chi phí Ads</th>
                <th className="px-4 py-3 text-right">Doanh thu</th>
                <th className="px-4 py-3 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((campaign) => (
                <tr key={`${campaign.rank}-${campaign.name}`} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-semibold text-gray-400">{campaign.rank}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{campaign.name}</td>
                  <td className="px-4 py-3 text-right text-orange-600">{campaign.adsCost}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{campaign.revenue}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-950">{campaign.roas}x</td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy campaign phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
