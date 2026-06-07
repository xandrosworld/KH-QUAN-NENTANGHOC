/**
 * File validation utilities — reusable across Import page and future upload flows.
 */

import type { FileValidationResult } from './import-types';

const DEFAULT_ALLOWED_EXTENSIONS = ['.xlsx', '.csv'];
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Format bytes into a human-readable string.
 *
 * @example formatFileSize(1536) // "1.5 KB"
 * @example formatFileSize(12582912) // "12.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Extract the file extension (lowercased, including the dot).
 *
 * @example getFileExtension('data.xlsx') // ".xlsx"
 * @example getFileExtension('noext') // ""
 */
export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.substring(idx).toLowerCase() : '';
}

/**
 * Validate a File object for extension and size.
 *
 * @param file - The File to validate
 * @param allowedExtensions - Array of extensions like ['.xlsx', '.csv']. Defaults to xlsx/csv.
 * @param maxSize - Max file size in bytes. Defaults to 50MB.
 * @returns FileValidationResult with valid flag, error message, and formatted size.
 */
export function validateFile(
  file: File,
  allowedExtensions: string[] = DEFAULT_ALLOWED_EXTENSIONS,
  maxSize: number = DEFAULT_MAX_SIZE,
): FileValidationResult {
  const ext = getFileExtension(file.name);

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      file,
      error: `Định dạng file không hợp lệ (${ext || 'không có'}). Chỉ chấp nhận: ${allowedExtensions.join(', ')}`,
      formattedSize: formatFileSize(file.size),
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      file,
      error: `Dung lượng file (${formatFileSize(file.size)}) vượt quá giới hạn ${formatFileSize(maxSize)}.`,
      formattedSize: formatFileSize(file.size),
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      file,
      error: 'File rỗng (0 bytes). Vui lòng chọn file có dữ liệu.',
      formattedSize: '0 B',
    };
  }

  return {
    valid: true,
    file,
    error: null,
    formattedSize: formatFileSize(file.size),
  };
}

/**
 * Extract files from a DragEvent, filtering to only the first file.
 * Returns null if no files were dropped.
 */
export function getDroppedFile(event: React.DragEvent): File | null {
  const dt = event.dataTransfer;
  if (dt.files && dt.files.length > 0) {
    return dt.files[0];
  }
  return null;
}
