'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Search,
  Calendar,
  ChevronDown,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { dataManagementRows, fileDetail } from '@/lib/mock-data';
import type { DataManagementRow, FileDetail } from '@/lib/types';

const tabs = ['Tất cả dữ liệu', 'Shopee', 'TikTok Shop', 'Ads', 'Giá vốn'];

const statusConfig = {
  success: { icon: CheckCircle2, text: 'Thành công', color: 'text-green-600 bg-green-50' },
  error: { icon: AlertCircle, text: 'Lỗi', color: 'text-red-600 bg-red-50' },
  processing: { icon: Loader2, text: 'Đang xử lý', color: 'text-yellow-600 bg-yellow-50' },
};

const summaryCards = [
  {
    label: 'Tổng file đã import',
    value: '128',
    icon: '/brand/icon-total-imported.svg',
    detail: '+ 12 file',
    detailSuffix: 'so với kỳ trước',
    detailColor: 'text-violet-600',
  },
  {
    label: 'Import thành công',
    value: '112',
    icon: '/brand/icon-import-success.svg',
    detail: '87.5%',
    detailSuffix: 'tổng file',
    detailColor: 'text-green-600',
  },
  {
    label: 'Import lỗi',
    value: '8',
    icon: '/brand/icon-import-error.svg',
    detail: '6.25%',
    detailSuffix: 'tổng file',
    detailColor: 'text-red-500',
  },
  {
    label: 'Đang xử lý',
    value: '8',
    icon: '/brand/icon-import-processing.svg',
    detail: '6.25%',
    detailSuffix: 'tổng file',
    detailColor: 'text-amber-500',
  },
];

const detailTabs = ['Tổng quan', 'Dữ liệu', 'Lịch sử xử lý'];

const getSourceIcon = (source: string) => {
  const value = source.toLowerCase();
  if (value.includes('shopee')) return '/brand/source-icons/shopee.png';
  if (value.includes('tiktok')) return '/brand/source-icons/tiktok.png';
  if (value.includes('lazada')) return '/brand/hero-login-optimized/lazada.webp';
  if (value.includes('ads') || value.includes('facebook') || value.includes('google')) {
    return '/brand/source-icons/ads-facebook.png';
  }
  return '/brand/source-icons/cogs.png';
};

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>('1');
  const [detailTab, setDetailTab] = useState(0);
  const [rows, setRows] = useState<DataManagementRow[]>(dataManagementRows);
  const [detail, setDetail] = useState<FileDetail>(fileDetail);
  const [summary, setSummary] = useState({ total: 128, success: 112, error: 8, processing: 8 });
  const selectedRow = rows.find((row) => row.id === selectedFile);
  const detailFileName = selectedRow?.fileName ?? detail.fileName;
  const detailSource = selectedRow?.source ?? detail.source;
  const detailDataType = selectedRow?.dataType ?? detail.dataType;
  const detailImportedBy = selectedRow?.importedBy ?? detail.importedBy;
  const detailImportDate = selectedRow?.importDate ?? detail.importDate;
  const detailDataRows = selectedRow?.dataRows ?? detail.dataRows;
  const displaySummaryCards = summaryCards.map((card) => {
    if (card.label.includes('Tổng file')) return { ...card, value: String(summary.total) };
    if (card.label.includes('thành công')) return { ...card, value: String(summary.success) };
    if (card.label.includes('lỗi')) return { ...card, value: String(summary.error) };
    return { ...card, value: String(summary.processing) };
  });

  useEffect(() => {
    let mounted = true;
    fetch('/api/imports')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted || !payload) return;
        if (payload.rows?.length) {
          setRows(payload.rows);
          setSelectedFile(payload.rows[0].id);
        }
        if (payload.fileDetail) setDetail(payload.fileDetail);
        if (payload.summary) setSummary(payload.summary);
      })
      .catch(() => {
        // Keep local mock data as fallback.
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý dữ liệu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý, kiểm tra và đồng bộ dữ liệu đã import vào hệ thống
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center border-b border-gray-200" style={{ gap: 28 }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`border-b-2 px-0.5 pb-2.5 text-sm font-medium transition-colors ${
                activeTab === idx
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-700 hover:text-green-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>01/05/2025 - 31/05/2025</span>
          </div>
          <div className="relative">
            <select className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Tất cả trạng thái</option>
              <option>Thành công</option>
              <option>Lỗi</option>
              <option>Đang xử lý</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative w-[280px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm file, nguồn dữ liệu..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {displaySummaryCards.map((card) => (
              <div
                key={card.label}
                className="flex min-h-[112px] items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-4"
              >
                <Image
                  src={card.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 flex-none"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700">{card.label}</p>
                  <p className="mt-0.5 text-2xl font-bold leading-tight text-gray-950">{card.value}</p>
                  <p className="mt-2 whitespace-nowrap text-[11px] text-gray-500">
                    <span className={`font-semibold ${card.detailColor}`}>{card.detail}</span>{' '}
                    {card.detailSuffix}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="px-1 text-base font-semibold text-gray-900">Danh sách dữ liệu import</h2>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tên file</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nguồn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày import</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Dòng</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Người import</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => {
                  const cfg = statusConfig[row.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${
                        selectedFile === row.id ? 'bg-green-50/50' : ''
                      }`}
                      onClick={() => setSelectedFile(row.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={getSourceIcon(row.source)}
                            alt=""
                            width={row.source === 'Ads' ? 38 : 30}
                            height={row.source === 'Ads' ? 38 : 30}
                            className={
                              row.source === 'Ads'
                                ? "-ml-1 h-9 w-9 shrink-0 object-contain"
                                : "h-7 w-7 shrink-0 object-contain"
                            }
                          />
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-gray-800 max-w-[190px]">
                              {row.fileName}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-gray-400">{row.fileSize}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.source}</td>
                      <td className="px-4 py-3 text-gray-600">{row.dataType}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{row.importDate}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.dataRows.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.color}`}>
                          <StatusIcon size={12} className={row.status === 'processing' ? 'animate-spin' : ''} />
                          {cfg.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{row.importedBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <Download size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">Hiển thị 1-{Math.min(rows.length, 8)} của {rows.length} kết quả</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
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

        {selectedFile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Chi tiết file import
              </h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
              <div className="flex items-center gap-3">
                <Image
                  src={getSourceIcon(detailSource)}
                  alt=""
                  width={detailSource === 'Ads' ? 54 : 44}
                  height={detailSource === 'Ads' ? 54 : 44}
                  className={
                    detailSource === 'Ads'
                      ? "-ml-1 h-14 w-14 shrink-0 object-contain"
                      : "h-11 w-11 shrink-0 object-contain"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-950">{detailFileName}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {detailSource} • {detailDataType}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
                  Thành công
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-5 bg-gray-50 rounded-lg p-1">
              {detailTabs.map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(idx)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    detailTab === idx
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3 text-sm">
              {[
                ['Tên file', detailFileName],
                ['Nguồn dữ liệu', detailSource],
                ['Loại dữ liệu', detailDataType],
                ['Người import', detailImportedBy],
                ['Ngày import', detailImportDate],
                ['Số dòng', detailDataRows.toLocaleString()],
                ['File gốc', detailFileName],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Thống kê</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{detail.validRows.toLocaleString()}</p>
                  <p className="text-xs text-green-600">Hợp lệ ({detail.validPercent})</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-red-600">{detail.errorRows}</p>
                  <p className="text-xs text-red-600">Lỗi ({detail.errorPercent})</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <p>Phạm vi: {detail.dateRangeFrom} - {detail.dateRangeTo}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                <Download size={14} />
                Tải file gốc
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-green-200 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                <Eye size={14} />
                Xem dữ liệu
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
                Xóa dữ liệu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
