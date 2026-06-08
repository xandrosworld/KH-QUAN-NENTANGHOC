'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { ImportJob } from '@/lib/data-types';
import type { DataManagementRow, FileDetail } from '@/lib/types';

type Summary = {
  total: number;
  success: number;
  error: number;
  processing: number;
};

type ImportsPayload = {
  jobs?: ImportJob[];
  rows?: DataManagementRow[];
  fileDetail?: FileDetail | null;
  summary?: Summary;
};

type StatusFilter = 'all' | DataManagementRow['status'];

const tabs = [
  { label: 'Tất cả dữ liệu', source: null },
  { label: 'Shopee', source: 'shopee' },
  { label: 'TikTok Shop', source: 'tiktok' },
  { label: 'Lazada', source: 'lazada' },
  { label: 'Ads', source: 'ads' },
  { label: 'Giá vốn', source: 'gia von' },
];

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Thành công', value: 'success' },
  { label: 'Lỗi', value: 'error' },
  { label: 'Đang xử lý', value: 'processing' },
];

const statusConfig = {
  success: { icon: CheckCircle2, text: 'Thành công', color: 'text-green-600 bg-green-50' },
  error: { icon: AlertCircle, text: 'Lỗi', color: 'text-red-600 bg-red-50' },
  processing: { icon: Loader2, text: 'Đang xử lý', color: 'text-yellow-600 bg-yellow-50' },
};

const summaryCards = [
  {
    key: 'total',
    label: 'Tổng file đã import',
    icon: '/brand/icon-total-imported.svg',
    detailColor: 'text-violet-600',
  },
  {
    key: 'success',
    label: 'Import thành công',
    icon: '/brand/icon-import-success.svg',
    detailColor: 'text-green-600',
  },
  {
    key: 'error',
    label: 'Import lỗi',
    icon: '/brand/icon-import-error.svg',
    detailColor: 'text-red-500',
  },
  {
    key: 'processing',
    label: 'Đang xử lý',
    icon: '/brand/icon-import-processing.svg',
    detailColor: 'text-amber-500',
  },
] as const;

const detailTabs = ['Tổng quan', 'Dữ liệu', 'Lịch sử xử lý'];
const pageSize = 8;
const emptySummary: Summary = { total: 0, success: 0, error: 0, processing: 0 };

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

function normalizeFilterText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function formatSummaryPercent(value: number, total: number) {
  return formatPercent((value / Math.max(total, 1)) * 100);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '-';
  return date.toLocaleString('vi-VN');
}

function formatDateOnly(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function buildFileDetail(job: ImportJob): FileDetail {
  return {
    fileName: job.fileName,
    source: job.sourceLabel,
    dataType: job.dataType,
    importedBy: job.importedBy,
    importDate: formatDateTime(job.importedAt),
    dataRows: job.validRows,
    originalFile: job.fileName,
    notes: job.errors[0] ?? '-',
    totalRows: job.totalRows,
    validRows: job.validRows,
    validPercent: formatSummaryPercent(job.validRows, job.totalRows),
    errorRows: job.errorRows,
    errorPercent: formatSummaryPercent(job.errorRows, job.totalRows),
    dateRangeFrom: formatDateOnly(job.dateRangeFrom),
    dateRangeTo: formatDateOnly(job.dateRangeTo),
  };
}

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState(0);
  const [rows, setRows] = useState<DataManagementRow[]>([]);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [detail, setDetail] = useState<FileDetail | null>(null);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const applyImportPayload = useCallback((payload: ImportsPayload) => {
    const nextRows = payload.rows ?? [];
    setRows(nextRows);
    setSelectedFile(nextRows[0]?.id ?? null);
    if (payload.jobs) setJobs(payload.jobs);
    setDetail(payload.fileDetail ?? null);
    setSummary(payload.summary ?? emptySummary);
  }, []);

  const loadImports = useCallback(async () => {
    const response = await fetch('/api/imports');
    if (!response.ok) return;
    applyImportPayload((await response.json()) as ImportsPayload);
  }, [applyImportPayload]);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/imports')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: ImportsPayload | null) => {
        if (!mounted || !payload) return;
        applyImportPayload(payload);
      })
      .catch(() => {
        // Giữ dữ liệu mặc định nếu API tạm thời không phản hồi.
      });

    return () => {
      mounted = false;
    };
  }, [applyImportPayload]);

  const filteredRows = useMemo(() => {
    const activeSource = tabs[activeTab]?.source;
    const normalizedQuery = normalizeFilterText(query.trim());

    return rows.filter((row) => {
      const searchableText = normalizeFilterText(
        [row.fileName, row.source, row.dataType, row.importDate, row.importedBy].join(' '),
      );
      const sourceText = normalizeFilterText(`${row.source} ${row.dataType}`);
      const matchesSource = !activeSource || sourceText.includes(activeSource);
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesSource && matchesStatus && matchesQuery;
    });
  }, [activeTab, query, rows, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const normalizedPage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice((normalizedPage - 1) * pageSize, normalizedPage * pageSize);
  const selectedRow = selectedFile && filteredRows.some((row) => row.id === selectedFile)
    ? rows.find((row) => row.id === selectedFile)
    : null;
  const selectedJob = jobs.find((job) => job.id === selectedFile);
  const selectedDetail = selectedJob ? buildFileDetail(selectedJob) : detail;
  const detailStatus = selectedRow?.status ?? selectedJob?.status ?? 'success';
  const detailStatusConfig = statusConfig[detailStatus];
  const firstVisibleRow = filteredRows.length === 0 ? 0 : (normalizedPage - 1) * pageSize + 1;
  const lastVisibleRow = Math.min(normalizedPage * pageSize, filteredRows.length);

  const previewRows = selectedJob?.preview ?? [];
  const previewColumns = [...new Set(previewRows.flatMap((row) => Object.keys(row)))].slice(0, 6);

  const displaySummaryCards = summaryCards.map((card) => {
    const value = summary[card.key];
    if (card.key === 'total') {
      return {
        ...card,
        value: String(value),
        detail: String(filteredRows.length),
        detailSuffix: 'đang hiển thị',
      };
    }

    return {
      ...card,
      value: String(value),
      detail: formatSummaryPercent(value, summary.total),
      detailSuffix: 'tổng file',
    };
  });

  const handleDownload = useCallback((jobId: string) => {
    const link = document.createElement('a');
    link.href = `/api/imports?jobId=${encodeURIComponent(jobId)}&format=csv`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const handleDelete = useCallback(
    async (jobId: string, fileName: string) => {
      const confirmed = window.confirm(`Xóa file import "${fileName}" và toàn bộ dữ liệu liên quan?`);
      if (!confirmed) return;

      setIsDeleting(jobId);
      setActionMessage(null);

      try {
        const response = await fetch(`/api/imports?jobId=${encodeURIComponent(jobId)}`, {
          method: 'DELETE',
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          setActionMessage(payload.error ?? 'Không xóa được file import. Vui lòng thử lại.');
          return;
        }

        setActionMessage(`Đã xóa file import "${fileName}".`);
        await loadImports();
      } catch {
        setActionMessage('Không kết nối được API xóa dữ liệu. Vui lòng thử lại.');
      } finally {
        setIsDeleting(null);
      }
    },
    [loadImports],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý dữ liệu</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý, kiểm tra và đồng bộ dữ liệu đã import vào hệ thống
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center border-b border-gray-200" style={{ gap: 28 }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(idx);
                resetToFirstPage();
              }}
              className={`border-b-2 px-0.5 pb-2.5 text-sm font-medium transition-colors ${
                activeTab === idx
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-700 hover:text-green-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>Tất cả thời gian</span>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                resetToFirstPage();
              }}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative w-[280px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetToFirstPage();
              }}
              placeholder="Tìm kiếm file, nguồn dữ liệu..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {actionMessage}
        </div>
      )}

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
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tên file</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Nguồn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Ngày import</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Dòng</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Người import</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedRows.map((row) => {
                    const cfg = statusConfig[row.status];
                    const StatusIcon = cfg.icon;
                    const deleting = isDeleting === row.id;

                    return (
                      <tr
                        key={row.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50/50 ${
                          selectedFile === row.id ? 'bg-green-50/50' : ''
                        }`}
                        onClick={() => {
                          setSelectedFile(row.id);
                          setDetailTab(0);
                        }}
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
                                  ? '-ml-1 h-9 w-9 shrink-0 object-contain'
                                  : 'h-7 w-7 shrink-0 object-contain'
                              }
                            />
                            <div className="min-w-0">
                              <span className="block max-w-[190px] truncate font-medium text-gray-800">
                                {row.fileName}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-gray-400">{row.fileSize}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{row.source}</td>
                        <td className="px-4 py-3 text-gray-600">{row.dataType}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{row.importDate}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{row.dataRows.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.color}`}>
                            <StatusIcon size={12} className={row.status === 'processing' ? 'animate-spin' : ''} />
                            {cfg.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{row.importedBy}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedFile(row.id);
                                setDetailTab(0);
                              }}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                              title="Xem chi tiết"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDownload(row.id);
                              }}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                              title="Xuất CSV"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDelete(row.id, row.fileName);
                              }}
                              disabled={deleting}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Xóa import"
                            >
                              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {pagedRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                        Không có file import nào khớp bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3">
              <span className="text-xs text-gray-500">
                Hiển thị {firstVisibleRow}-{lastVisibleRow} của {filteredRows.length} kết quả
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                      page === normalizedPage ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedFile && selectedRow && selectedDetail && (
          <div className="h-fit rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Chi tiết file import
              </h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
              <div className="flex items-center gap-3">
                <Image
                  src={getSourceIcon(selectedDetail.source)}
                  alt=""
                  width={selectedDetail.source === 'Ads' ? 54 : 44}
                  height={selectedDetail.source === 'Ads' ? 54 : 44}
                  className={
                    selectedDetail.source === 'Ads'
                      ? '-ml-1 h-14 w-14 shrink-0 object-contain'
                      : 'h-11 w-11 shrink-0 object-contain'
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-950">{selectedDetail.fileName}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedDetail.source} • {selectedDetail.dataType}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${detailStatusConfig.color}`}>
                  {detailStatusConfig.text}
                </span>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-1 rounded-lg bg-gray-50 p-1">
              {detailTabs.map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(idx)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    detailTab === idx
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {detailTab === 0 && (
              <>
                <div className="space-y-3 text-sm">
                  {[
                    ['Tên file', selectedDetail.fileName],
                    ['Nguồn dữ liệu', selectedDetail.source],
                    ['Loại dữ liệu', selectedDetail.dataType],
                    ['Người import', selectedDetail.importedBy],
                    ['Ngày import', selectedDetail.importDate],
                    ['Số dòng', selectedDetail.dataRows.toLocaleString('vi-VN')],
                    ['File gốc', selectedDetail.originalFile],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-right font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Thống kê</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-lg font-bold text-green-600">{selectedDetail.validRows.toLocaleString('vi-VN')}</p>
                      <p className="text-xs text-green-600">Hợp lệ ({selectedDetail.validPercent})</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 text-center">
                      <p className="text-lg font-bold text-red-600">{selectedDetail.errorRows.toLocaleString('vi-VN')}</p>
                      <p className="text-xs text-red-600">Lỗi ({selectedDetail.errorPercent})</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>Phạm vi: {selectedDetail.dateRangeFrom} - {selectedDetail.dateRangeTo}</p>
                  </div>
                </div>
              </>
            )}

            {detailTab === 1 && (
              <div className="space-y-3">
                {previewRows.length > 0 && previewColumns.length > 0 ? (
                  <div className="max-h-[280px] overflow-auto rounded-lg border border-gray-100">
                    <table className="min-w-full text-xs">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          {previewColumns.map((column) => (
                            <th key={column} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-500">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {previewRows.map((row, index) => (
                          <tr key={index}>
                            {previewColumns.map((column) => (
                              <td key={column} className="max-w-[180px] truncate px-3 py-2 text-gray-700">
                                {String(row[column] ?? '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    Chưa có preview dòng dữ liệu cho file này.
                  </div>
                )}
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
                >
                  <Download size={14} />
                  Xuất toàn bộ dữ liệu CSV
                </button>
              </div>
            )}

            {detailTab === 2 && (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="font-semibold text-gray-900">Import hoàn tất</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedDetail.importDate} • {selectedDetail.importedBy}
                  </p>
                </div>
                {(selectedJob?.errors ?? []).length > 0 ? (
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="font-semibold text-amber-700">Kết quả xử lý</p>
                    <ul className="mt-2 space-y-1 text-xs text-amber-700">
                      {selectedJob?.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-green-700">
                    Không có lỗi xử lý trong lần import này.
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 grid gap-2">
              <button
                onClick={() => handleDownload(selectedFile)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <Download size={14} />
                Xuất CSV
              </button>
              <button
                onClick={() => setDetailTab(1)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
              >
                <Eye size={14} />
                Xem dữ liệu
              </button>
              <button
                onClick={() => void handleDelete(selectedFile, selectedDetail.fileName)}
                disabled={isDeleting === selectedFile}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting === selectedFile ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Xóa dữ liệu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
