/**
 * Import module types — Phase 1 implementation prep
 *
 * These types define the data structures for importing data from
 * Shopee, TikTok Shop, Ads, and COGS (Giá vốn) sources.
 *
 * NOTE: Actual column mappings and business rules are pending
 * confirmation from the client via sample Excel/CSV files.
 */

// ────────────────────────────────────────────────────────────
// Source definitions
// ────────────────────────────────────────────────────────────

export const IMPORT_SOURCES = ['shopee', 'tiktok', 'ads', 'cogs'] as const;
export type ImportSource = (typeof IMPORT_SOURCES)[number];

export interface ImportSourceMeta {
  id: ImportSource;
  label: string;
  description: string;
  /** Accepted file extensions for this source */
  acceptedExtensions: string[];
  /** Max file size in bytes */
  maxFileSize: number;
  /**
   * TODO: Column mapping schema per source
   * Chờ khách cung cấp file mẫu để xác nhận cột dữ liệu.
   * Ví dụ Shopee: Mã đơn hàng, Ngày tạo, Tổng tiền, ...
   */
  // columnSchema: ColumnMapping[];
}

export const SOURCE_META: Record<ImportSource, ImportSourceMeta> = {
  shopee: {
    id: 'shopee',
    label: 'Shopee',
    description: 'Dữ liệu đơn hàng, doanh thu từ Shopee',
    acceptedExtensions: ['.xlsx', '.xls', '.csv'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok Shop',
    description: 'Dữ liệu đơn hàng, doanh thu từ TikTok Shop',
    acceptedExtensions: ['.xlsx', '.xls', '.csv'],
    maxFileSize: 50 * 1024 * 1024,
  },
  ads: {
    id: 'ads',
    label: 'Ads',
    description: 'Chi phí quảng cáo từ Facebook, TikTok, Google',
    acceptedExtensions: ['.xlsx', '.xls', '.csv'],
    maxFileSize: 50 * 1024 * 1024,
  },
  cogs: {
    id: 'cogs',
    label: 'Giá vốn',
    description: 'Giá vốn sản phẩm và chi phí liên quan',
    acceptedExtensions: ['.xlsx', '.xls', '.csv'],
    maxFileSize: 50 * 1024 * 1024,
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
  /**
   * TODO: Parsed preview data (first N rows)
   * Structure depends on source column schema.
   */
  // previewData: Record<string, unknown>[] | null;
  /**
   * TODO: Column mapping result
   * Auto-detected mapping from file columns to system fields.
   */
  // columnMapping: ColumnMappingResult | null;
}

// ────────────────────────────────────────────────────────────
// KPI formulas — PENDING CLIENT CONFIRMATION
// ────────────────────────────────────────────────────────────

/**
 * KPI công thức tính — CHƯA XÁC NHẬN
 *
 * Các công thức dưới đây là placeholder. Cần chờ khách xác nhận:
 * 1. Công thức tính Lợi nhuận gộp
 * 2. Cách phân bổ chi phí vận chuyển
 * 3. Cách tính Net Profit (trừ những khoản nào)
 * 4. ROAS tính theo chi phí Ads nào (Facebook? TikTok? Tổng?)
 * 5. Cách xử lý hoàn hàng trong doanh thu
 *
 * Reference: Figma "Công thức lợi nhuận đang áp dụng" panel
 * shows: Giá Profit = Doanh thu - Giá vốn - Chi phí Ads - Phí sàn - Vận chuyển - Phí khác
 * But this needs client sign-off on exact definitions.
 */
export interface KpiFormulaConfig {
  id: string;
  name: string;
  /**
   * TODO: Actual formula expression or calculation function
   * Chờ file mẫu và công thức khách xác nhận.
   */
  formula: string; // placeholder — e.g. "doanhThu - giaVon - chiPhiAds - phiSan - vanChuyen - phiKhac"
  description: string;
}
