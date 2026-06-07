"use client";

import { Package, Search, TrendingUp } from "lucide-react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { channelRevenue, topProducts } from "@/lib/mock-data";

export default function ProductsReportPage() {
  const analytics = useAnalyticsData();
  const products = analytics?.topProducts ?? topProducts;
  const totalRevenue = analytics?.totals.revenue ?? channelRevenue.reduce((sum, item) => sum + item.value, 0);
  const soldProducts = analytics?.totals.soldProducts ?? 812345;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo sản phẩm</h1>
          <p className="mt-1 text-sm text-gray-500">Theo dõi doanh thu, lợi nhuận và hiệu quả từng sản phẩm.</p>
        </div>
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Tìm sản phẩm..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Sản phẩm đã bán", value: soldProducts.toLocaleString("vi-VN"), icon: Package, color: "text-blue-600 bg-blue-50" },
          { label: "Doanh thu sản phẩm", value: `${Math.round(totalRevenue).toLocaleString("vi-VN")} đ`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Sản phẩm nổi bật", value: products[0]?.name ?? "-", icon: Package, color: "text-orange-600 bg-orange-50" },
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
          <h2 className="text-base font-semibold text-gray-950">Top sản phẩm theo lợi nhuận</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Sản phẩm</th>
                <th className="px-4 py-3 text-right">Doanh thu</th>
                <th className="px-4 py-3 text-right">Lợi nhuận</th>
                <th className="px-4 py-3 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={`${product.rank}-${product.name}`} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-semibold text-gray-400">{product.rank}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{product.revenue}</td>
                  <td className="px-4 py-3 text-right text-green-600">{product.profit}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-950">{product.netProfit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
