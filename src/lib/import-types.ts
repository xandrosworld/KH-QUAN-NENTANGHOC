/**
 * Import module types — Phase 1 implementation prep
 *
 * These types define the data structures for importing data from
 * Shopee, TikTok Shop, Lazada, Ads, and COGS (Giá vốn) sources.
 *
 * The parser includes auto-detection candidates for common headers.
 * Client sample files are only needed to lock source-specific mappings.
 */

// ────────────────────────────────────────────────────────────
// Source definitions
// ────────────────────────────────────────────────────────────

export const IMPORT_SOURCES = ['shopee', 'tiktok', 'lazada', 'ads', 'giavon'] as const;
export type ImportSource = (typeof IMPORT_SOURCES)[number];

export interface ColumnMappingCandidate {
  field: string;
  label: string;
  candidates: string[];
  required: boolean;
}

export interface ImportSourceMeta {
  id: ImportSource;
  label: string;
  description: string;
  /** Accepted file extensions for this source */
  acceptedExtensions: string[];
  /** Max file size in bytes */
  maxFileSize: number;
  /** Auto-detected mapping candidates used before source-specific lock-in. */
  columnSchema: ColumnMappingCandidate[];
}

const ORDER_COLUMN_SCHEMA: ColumnMappingCandidate[] = [
  { field: 'orderId', label: 'Mã đơn hàng', candidates: ['mã đơn', 'order id', 'order no'], required: false },
  { field: 'date', label: 'Ngày đơn', candidates: ['ngày', 'date', 'created', 'thời gian'], required: true },
  { field: 'productName', label: 'Tên sản phẩm', candidates: ['tên sản phẩm', 'product name', 'item name'], required: true },
  { field: 'sku', label: 'SKU', candidates: ['sku', 'mã hàng', 'seller sku'], required: false },
  { field: 'quantity', label: 'Số lượng', candidates: ['số lượng', 'quantity', 'qty'], required: false },
  { field: 'revenue', label: 'Doanh thu', candidates: ['doanh thu', 'thành tiền', 'total amount', 'paid amount'], required: true },
  { field: 'platformFee', label: 'Phí sàn', candidates: ['phí sàn', 'commission', 'platform fee', 'service fee'], required: false },
  { field: 'status', label: 'Trạng thái', candidates: ['trạng thái', 'status', 'order status'], required: false },
];

const ADS_COLUMN_SCHEMA: ColumnMappingCandidate[] = [
  { field: 'date', label: 'Ngày', candidates: ['ngày', 'date', 'day'], required: true },
  { field: 'campaignName', label: 'Campaign', candidates: ['campaign', 'chiến dịch', 'tên quảng cáo'], required: true },
  { field: 'adsCost', label: 'Chi phí Ads', candidates: ['chi phí', 'cost', 'spend', 'amount spent'], required: true },
  { field: 'revenue', label: 'Doanh thu quy đổi', candidates: ['doanh thu', 'revenue', 'conversion value'], required: false },
];

const COGS_COLUMN_SCHEMA: ColumnMappingCandidate[] = [
  { field: 'productName', label: 'Tên sản phẩm', candidates: ['tên sản phẩm', 'product name', 'item name'], required: true },
  { field: 'sku', label: 'SKU', candidates: ['sku', 'mã hàng', 'seller sku'], required: false },
  { field: 'cogs', label: 'Giá vốn', candidates: ['giá vốn', 'cogs', 'cost', 'unit cost'], required: true },
];

export const SOURCE_META: Record<ImportSource, ImportSourceMeta> = {
  shopee: {
    id: 'shopee',
    label: 'Shopee',
    description: 'Dữ liệu đơn hàng, doanh thu từ Shopee',
    acceptedExtensions: ['.xlsx', '.csv'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    columnSchema: ORDER_COLUMN_SCHEMA,
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok Shop',
    description: 'Dữ liệu đơn hàng, doanh thu từ TikTok Shop',
    acceptedExtensions: ['.xlsx', '.csv'],
    maxFileSize: 50 * 1024 * 1024,
    columnSchema: ORDER_COLUMN_SCHEMA,
  },
  lazada: {
    id: 'lazada',
    label: 'Lazada',
    description: 'Dữ liệu đơn hàng, doanh thu từ Lazada',
    acceptedExtensions: ['.xlsx', '.csv'],
    maxFileSize: 50 * 1024 * 1024,
    columnSchema: ORDER_COLUMN_SCHEMA,
  },
  ads: {
    id: 'ads',
    label: 'Ads',
    description: 'Chi phí quảng cáo từ Facebook, TikTok, Google',
    acceptedExtensions: ['.xlsx', '.csv'],
    maxFileSize: 50 * 1024 * 1024,
    columnSchema: ADS_COLUMN_SCHEMA,
  },
  giavon: {
    id: 'giavon',
    label: 'Giá vốn',
    description: 'Giá vốn sản phẩm và chi phí liên quan',
    acceptedExtensions: ['.xlsx', '.csv'],
    maxFileSize: 50 * 1024 * 1024,
    columnSchema: COGS_COLUMN_SCHEMA,
  },
};

// ────────────────────────────────────────────────────────────
// File validation
// ────────────────────────────────────────────────────────────

export interface FileValidationResult {
  valid: boolean;
  file: File | null;
  error: string | null;
  /** Formatted file size string, e.g. "12.5 MB" */
  formattedSize: string | null;
}

// ────────────────────────────────────────────────────────────
// Import job lifecycle
// ────────────────────────────────────────────────────────────

export const IMPORT_STEPS = [
  'select_source',
  'upload_file',
  'preview_mapping',
  'confirm_import',
] as const;
export type ImportStep = (typeof IMPORT_STEPS)[number];

export type ImportJobStatus =
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'mapping'
  | 'confirming'
  | 'importing'
  | 'success'
  | 'error';

export interface ImportJob {
  id: string;
  source: ImportSource;
  fileName: string;
  fileSize: number;
  status: ImportJobStatus;
  currentStep: ImportStep;
  createdAt: string;
  updatedAt: string;
  /** Total rows detected in the file */
  totalRows: number | null;
  /** Rows successfully parsed */
  validRows: number | null;
  /** Rows with parse errors */
  errorRows: number | null;
  /** Error message if status === 'error' */
  errorMessage: string | null;
  /** Parsed preview data (first rows) for review before final source-specific mapping. */
  previewData?: Record<string, unknown>[] | null;
  /** Auto-detected mapping from file columns to system fields. */
  columnMapping?: Record<string, string> | null;
}

// ────────────────────────────────────────────────────────────
// KPI formulas — PHASE 1
// ────────────────────────────────────────────────────────────

/**
 * KPI công thức tính Phase 1.
 *
 * Công thức đã được đưa vào engine tính toán ở `server/analytics.ts`.
 * Khi khách gửi file mẫu, phần còn lại là khóa column mapping theo header thực tế.
 */
export interface KpiFormulaConfig {
  id: string;
  name: string;
  /**
   * Formula expression shown in the KPI settings screen.
   */
  formula: string;
  description: string;
}
