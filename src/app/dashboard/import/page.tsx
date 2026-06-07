"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Download,
  FileText,
  Info,
  Loader2,
  MessageSquare,
  MoreVertical,
  X,
} from "lucide-react";
import { importHistory } from "@/lib/mock-data";
import { formatFileSize, getDroppedFile, validateFile } from "@/lib/file-utils";
import type { ImportHistoryItem } from "@/lib/types";

const sources = [
  {
    id: "shopee",
    label: "Shopee",
    desc: "Dữ liệu đơn hàng, doanh thu từ Shopee",
    icon: "/brand/source-icons/shopee.png",
  },
  {
    id: "tiktok",
    label: "TikTok Shop",
    desc: "Dữ liệu đơn hàng, doanh thu từ TikTok Shop",
    icon: "/brand/source-icons/tiktok.png",
  },
  {
    id: "ads",
    label: "Ads",
    desc: "Dữ liệu chi phí quảng cáo từ Facebook, TikTok, Google",
    icon: "/brand/source-icons/ads-facebook.png",
  },
  {
    id: "giavon",
    label: "Giá vốn",
    desc: "Dữ liệu giá vốn sản phẩm và chi phí liên quan",
    icon: "/brand/source-icons/cogs.png",
  },
];

const steps = [
  { num: 1, label: "Chọn nguồn\ndữ liệu" },
  { num: 2, label: "Upload file" },
  { num: 3, label: "Kiểm tra\n dữ liệu" },
  { num: 4, label: "Xác nhận\nimport" },
];

const statusConfig = {
  success: { icon: CheckCircle2, text: "Thành công", bg: "bg-green-50", textColor: "text-green-600" },
  error: { icon: AlertCircle, text: "Lỗi", bg: "bg-red-50", textColor: "text-red-500" },
  processing: { icon: Loader2, text: "Đang xử lý", bg: "bg-amber-50", textColor: "text-amber-500" },
};

const sourceIconMap = {
  shopee: "/brand/source-icons/shopee.png",
  tiktok: "/brand/source-icons/tiktok.png",
  lazada: "/brand/hero-login-optimized/lazada.webp",
  ads: "/brand/source-icons/ads-facebook.png",
  giavon: "/brand/source-icons/cogs.png",
};

const templateMap: Record<string, string> = {
  shopee: "/templates/shopee-template.csv",
  tiktok: "/templates/tiktok-template.csv",
  lazada: "/templates/lazada-template.csv",
  ads: "/templates/ads-template.csv",
  giavon: "/templates/giavon-template.csv",
};

export default function ImportPage() {
  const [selectedSource, setSelectedSource] = useState("shopee");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [historyItems, setHistoryItems] = useState<ImportHistoryItem[]>(importHistory);
  const [isDragging, setIsDragging] = useState(false);
  const [importedByName, setImportedByName] = useState("Nguyễn Văn A");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImportHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/imports");
      if (!response.ok) return;
      const payload = await response.json();
      const items: ImportHistoryItem[] = payload.jobs.map((job: {
        id: string;
        fileName: string;
        source: ImportHistoryItem["source"];
        sourceLabel: string;
        importedAt: string;
        fileSize: number;
        validRows: number;
        dataType: string;
        status: ImportHistoryItem["status"];
      }) => ({
        id: job.id,
        fileName: job.fileName,
        source: job.source,
        sourceLabel: job.sourceLabel || job.dataType,
        date: new Date(job.importedAt).toLocaleString("vi-VN"),
        size: formatFileSize(job.fileSize),
        records: `${job.validRows.toLocaleString("vi-VN")} dòng`,
        status: job.status,
      }));
      if (items.length) setHistoryItems(items);
    } catch {
      // Giữ lịch sử mặc định nếu API tạm thời không phản hồi.
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/imports")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted || !payload) return;
        const items: ImportHistoryItem[] = payload.jobs.map((job: {
          id: string;
          fileName: string;
          source: ImportHistoryItem["source"];
          sourceLabel: string;
          importedAt: string;
          fileSize: number;
          validRows: number;
          dataType: string;
          status: ImportHistoryItem["status"];
        }) => ({
          id: job.id,
          fileName: job.fileName,
          source: job.source,
          sourceLabel: job.sourceLabel || job.dataType,
          date: new Date(job.importedAt).toLocaleString("vi-VN"),
          size: formatFileSize(job.fileSize),
          records: `${job.validRows.toLocaleString("vi-VN")} dòng`,
          status: job.status,
        }));
        if (items.length) setHistoryItems(items);
      })
      .catch(() => {
        // Giữ lịch sử mặc định nếu API tạm thời không phản hồi.
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted || !payload?.profile?.name) return;
        setImportedByName(payload.profile.name);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const profile = (event as CustomEvent<{ name?: string }>).detail;
      if (profile?.name) setImportedByName(profile.name);
    };

    window.addEventListener("tronx-profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("tronx-profile-updated", handleProfileUpdated);
  }, []);

  const validateAndSetFile = useCallback((file: File) => {
    const result = validateFile(file);
    if (!result.valid) {
      setFileError(result.error);
      setImportMessage(null);
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setImportMessage(null);
    setSelectedFile(file);
  }, []);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) validateAndSetFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [validateAndSetFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = getDroppedFile(event);
      if (file) validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleImportSubmit = useCallback(async () => {
    if (!selectedFile) {
      setFileError("Vui lòng chọn file trước khi import.");
      return;
    }

    setIsImporting(true);
    setImportMessage(null);
    setFileError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("source", selectedSource);
    formData.append("importedBy", importedByName);

    try {
      const response = await fetch("/api/imports", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        setFileError(payload.error ?? "Import thất bại. Vui lòng kiểm tra lại file.");
        return;
      }

      setImportMessage(`Import thành công ${Number(payload.recordsImported ?? 0).toLocaleString("vi-VN")} dòng dữ liệu.`);
      setSelectedFile(null);
      await loadImportHistory();
    } catch {
      setFileError("Không kết nối được API import. Vui lòng thử lại.");
    } finally {
      setIsImporting(false);
    }
  }, [importedByName, loadImportHistory, selectedFile, selectedSource]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Import dữ liệu</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload file dữ liệu từ các nền tảng để cập nhật vào hệ thống.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-0 border-b border-gray-200 p-5">
            {steps.map((step, index) => (
              <div key={step.num} className="flex flex-1 items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.num}
                  </div>
                  <span
                    className={`whitespace-pre-line text-sm font-medium leading-tight ${
                      index === 0 ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-4 h-px flex-1 bg-gray-200" />
                )}
              </div>
            ))}
          </div>

          <section className="border-b border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-950">1. Chọn nguồn dữ liệu</h2>
            <p className="mt-1 text-sm italic text-gray-600">
              Vui lòng chọn nền tảng và loại dữ liệu bạn muốn import
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {sources.map((source) => {
                const active = selectedSource === source.id;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`flex min-h-[104px] flex-col items-start justify-between rounded-xl border bg-white p-3 text-left transition ${
                      active
                        ? "border-green-500 shadow-[0_0_0_1px_rgba(0,155,83,0.35)]"
                        : "border-gray-200 hover:border-green-200"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <Image
                        src={source.icon}
                        alt=""
                        width={source.id === "ads" ? 42 : 28}
                        height={source.id === "ads" ? 42 : 28}
                        className={
                          source.id === "ads"
                            ? "-mt-1 h-10 w-10 object-contain"
                            : "h-7 w-7 object-contain"
                        }
                      />
                      <span
                        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          active ? "border-green-500" : "border-gray-300"
                        }`}
                      >
                        {active && <span className="h-2.5 w-2.5 rounded-full bg-green-500" />}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-950">{source.label}</p>
                      <p className="mt-1 text-[11px] leading-snug text-gray-600">{source.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Info size={18} className="text-green-600" />
                <span>Bạn có thể tải file mẫu để xem định dạng dữ liệu chuẩn trước khi import.</span>
              </div>
              <a
                href={templateMap[selectedSource]}
                download
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                <Download size={16} />
                Tải file mẫu
              </a>
            </div>
          </section>

          <section className="border-b border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-950">2. Upload file</h2>
            <p className="mt-1 text-sm italic text-gray-600">
              Hỗ trợ định dạng Excel (xlsx) và CSV (csv)
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-5 rounded-lg border-2 border-dashed bg-white p-10 text-center transition ${
                isDragging
                  ? "border-green-500 bg-green-50/40"
                  : fileError
                    ? "border-red-300"
                    : "border-gray-200 hover:border-green-300"
              }`}
            >
              <CloudUpload size={46} className="mx-auto mb-4 text-gray-400" />
              <p className="text-base font-medium text-gray-700">Kéo & thả file vào đây</p>
              <p className="mt-2 text-sm text-gray-500">hoặc</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Chọn file từ máy tính
              </button>
              <p className="mt-3 text-xs text-gray-500">Dung lượng tối đa: 50MB</p>
            </div>

            {fileError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{fileError}</p>
              </div>
            )}

            {selectedFile && !fileError && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText size={18} className="shrink-0 text-green-600" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFileError(null);
                    setImportMessage(null);
                  }}
                  className="shrink-0 p-1 text-gray-400 transition hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {selectedFile && !fileError && (
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setImportMessage(null);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={isImporting}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isImporting && <Loader2 size={16} className="animate-spin" />}
                  {isImporting ? "Đang import..." : "Import dữ liệu"}
                </button>
              </div>
            )}

            {importMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                <p className="text-sm font-medium text-green-700">{importMessage}</p>
              </div>
            )}
          </section>

          <section className="bg-green-50/70 p-5">
            <h2 className="text-base font-bold text-gray-950">Hướng dẫn import dữ liệu</h2>
            <div className="mt-5 grid grid-cols-2 gap-x-10 gap-y-5">
              {[
                ["1.", "Tải file mẫu", "Tải file mẫu theo từng nguồn dữ liệu để xem định dạng chuẩn."],
                ["3.", "Kiểm tra dữ liệu", "Upload file và hệ thống sẽ tự động đọc, chuẩn hóa, kiểm tra các dòng dữ liệu."],
                ["2.", "Chuẩn bị dữ liệu", "Điền dữ liệu vào file mẫu, đảm bảo đúng định dạng và đầy đủ thông tin"],
                ["4.", "Xác nhận import", "Kiểm tra lại dữ liệu và xác nhận để hoàn tất import."],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex items-start gap-2">
                  <span className="font-semibold text-gray-950">{num}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
                    <p className="mt-1 text-sm italic leading-snug text-gray-700">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <MessageSquare size={22} className="mt-0.5 shrink-0 text-green-600" />
              <div>
                <h3 className="text-base font-bold text-green-700">Lưu ý quan trọng</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-900">
                  <li>Vui lòng không thay đổi tên các cột trong file mẫu.</li>
                  <li>Đảm bảo dữ liệu không bị trùng lặp trong cùng kỳ</li>
                  <li>Nên import theo thứ tự: Giá vốn - Đơn hàng - Ads</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-950">Lịch sử import</h2>
            <button className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700">
              Xem thêm
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-0">
            {historyItems.map((item) => {
              const cfg = statusConfig[item.status];
              return (
                <div key={item.id} className="border-b border-gray-100 py-4 last:border-b-0">
                  <div className="flex gap-4">
                    <Image
                      src={sourceIconMap[item.source]}
                      alt=""
                      width={item.source === "ads" ? 56 : 48}
                      height={item.source === "ads" ? 56 : 48}
                      className={
                        item.source === "ads"
                          ? "-ml-1 h-14 w-14 shrink-0 object-contain"
                          : "h-12 w-12 shrink-0 object-contain"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-bold text-gray-950">{item.fileName}</p>
                        <span className={`shrink-0 rounded-md px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.textColor}`}>
                          {cfg.text}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.sourceLabel} <span className="mx-1">•</span> {item.date}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                          {item.records} <span className="mx-1">•</span> {item.size}
                        </p>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Download size={16} />
                          <MoreVertical size={16} />
                        </div>
                      </div>
                      {item.status === "error" && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                          Lỗi: Sai định dạng file. Vui lòng kiểm tra lại.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
