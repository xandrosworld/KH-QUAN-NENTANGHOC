"use client";

import { CalendarDays, Filter, RefreshCcw, Search } from "lucide-react";
import type { AnalyticsActiveFilters, AnalyticsFilterOptions, ImportSource } from "@/lib/data-types";

type AnalyticsFilterBarProps = {
  filters: AnalyticsActiveFilters;
  options?: AnalyticsFilterOptions;
  recordCount?: {
    total: number;
    filtered: number;
  };
  onChange: (filters: AnalyticsActiveFilters) => void;
};

const fallbackSources: { value: ImportSource; label: string }[] = [
  { value: "shopee", label: "Shopee" },
  { value: "tiktok", label: "TikTok Shop" },
  { value: "lazada", label: "Lazada" },
  { value: "ads", label: "Ads" },
];

function hasActiveFilters(filters: AnalyticsActiveFilters) {
  return Boolean(filters.from || filters.to || filters.source || filters.product || filters.campaign);
}

export default function AnalyticsFilterBar({ filters, options, recordCount, onChange }: AnalyticsFilterBarProps) {
  const sources = options?.sources.length ? options.sources : fallbackSources;
  const active = hasActiveFilters(filters);

  const updateFilter = <Key extends keyof AnalyticsActiveFilters>(key: Key, value: AnalyticsActiveFilters[Key] | "") => {
    onChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Filter size={16} className="text-green-600" />
          <span>Bộ lọc báo cáo</span>
        </div>
        <div className="flex items-center gap-3">
          {recordCount && (
            <span className="text-xs font-medium text-gray-500">
              {recordCount.filtered.toLocaleString("vi-VN")}/{recordCount.total.toLocaleString("vi-VN")} dòng dữ liệu
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange({})}
            disabled={!active}
            title="Xóa bộ lọc"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCcw size={15} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.1fr_1.4fr_1.4fr]">
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
            <CalendarDays size={13} />
            Từ ngày
          </span>
          <input
            type="date"
            value={filters.from ?? ""}
            min={options?.dateRange.from}
            max={filters.to ?? options?.dateRange.to}
            onChange={(event) => updateFilter("from", event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
          />
        </label>

        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
            <CalendarDays size={13} />
            Đến ngày
          </span>
          <input
            type="date"
            value={filters.to ?? ""}
            min={filters.from ?? options?.dateRange.from}
            max={options?.dateRange.to}
            onChange={(event) => updateFilter("to", event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-gray-500">Sàn / nguồn</span>
          <select
            value={filters.source ?? ""}
            onChange={(event) => updateFilter("source", event.target.value as ImportSource | "")}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
          >
            <option value="">Tất cả</option>
            {sources.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
            <Search size={13} />
            Sản phẩm / SKU
          </span>
          <input
            value={filters.product ?? ""}
            list="analytics-products"
            onChange={(event) => updateFilter("product", event.target.value)}
            placeholder="Tên sản phẩm hoặc SKU"
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
          />
          <datalist id="analytics-products">
            {options?.products.map((product) => (
              <option key={product} value={product} />
            ))}
          </datalist>
        </label>

        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500">
            <Search size={13} />
            Campaign
          </span>
          <input
            value={filters.campaign ?? ""}
            list="analytics-campaigns"
            onChange={(event) => updateFilter("campaign", event.target.value)}
            placeholder="Tên campaign"
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-50"
          />
          <datalist id="analytics-campaigns">
            {options?.campaigns.map((campaign) => (
              <option key={campaign} value={campaign} />
            ))}
          </datalist>
        </label>
      </div>
    </div>
  );
}
