import { randomUUID } from 'crypto';
import readXlsxFile from 'read-excel-file/node';
import type { ImportJob, ImportResult, ImportSource, NormalizedOrderStatus, NormalizedRecord } from '@/lib/data-types';

const sourceLabels: Record<ImportSource, string> = {
  shopee: 'Shopee',
  tiktok: 'TikTok Shop',
  lazada: 'Lazada',
  ads: 'Ads',
  giavon: 'Giá vốn',
};

const sourceDataTypes: Record<ImportSource, string> = {
  shopee: 'Đơn hàng',
  tiktok: 'Đơn hàng',
  lazada: 'Đơn hàng',
  ads: 'Chi phí quảng cáo',
  giavon: 'Giá vốn sản phẩm',
};

function removeDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function normalizeHeader(value: string) {
  return removeDiacritics(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function parseCsv(content: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((cell, index) => cell.trim() || `Column ${index + 1}`);
  return rows.slice(1).map((cells) => {
    const item: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      item[header] = cells[index]?.trim() ?? '';
    });
    return item;
  });
}

async function readRows(file: File): Promise<Record<string, unknown>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith('.csv')) {
    const content = new TextDecoder('utf-8').decode(arrayBuffer).replace(/^\uFEFF/, '');
    return parseCsv(content);
  }

  if (lowerName.endsWith('.xls')) {
    throw new Error('File .xls legacy chưa được hỗ trợ an toàn. Vui lòng xuất lại file dạng .xlsx hoặc .csv.');
  }

  const sheetRows = await readXlsxFile(Buffer.from(arrayBuffer)) as unknown as unknown[][];
  if (sheetRows.length === 0) return [];

  const headers = sheetRows[0].map((cell, index) => toStringValue(cell) || `Column ${index + 1}`);
  return sheetRows.slice(1).map((cells) => {
    const item: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      item[header] = cells[index] ?? '';
    });
    return item;
  });
}

function getValue(row: Record<string, unknown>, candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeHeader);
  const entry = Object.entries(row).find(([key]) => {
    const normalizedKey = normalizeHeader(key);
    return normalizedCandidates.some((candidate) => normalizedKey.includes(candidate) || candidate.includes(normalizedKey));
  });
  return entry?.[1];
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = toStringValue(value);
  if (!raw) return 0;

  const cleaned = raw
    .replace(/\s/g, '')
    .replace(/[₫đvndVND]/g, '')
    .replace(/[^0-9,.-]/g, '');

  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  let normalized = cleaned;

  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = cleaned.replace(/,/g, '');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value: unknown) {
  const raw = toStringValue(value);
  if (!raw) return new Date().toISOString().slice(0, 10);

  const directDate = new Date(raw);
  if (!Number.isNaN(directDate.getTime())) return directDate.toISOString().slice(0, 10);

  const match = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

function parseStatus(value: unknown): NormalizedOrderStatus {
  const normalized = normalizeHeader(toStringValue(value));
  if (!normalized) return 'success';
  if (/(hoan|refund|return)/.test(normalized)) return 'refunded';
  if (/(huy|cancel)/.test(normalized)) return 'cancelled';
  if (/(thanh cong|completed|delivered|da giao|success)/.test(normalized)) return 'success';
  return 'unknown';
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const stringValue = toStringValue(value);
    if (stringValue) return stringValue;
  }
  return '';
}

function isRowEmpty(row: Record<string, unknown>) {
  return Object.values(row).every((value) => toStringValue(value) === '');
}

function normalizeOrderRow(row: Record<string, unknown>, source: ImportSource, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;

  const status = parseStatus(getValue(row, ['trạng thái', 'status', 'order status', 'tình trạng']));
  const quantity = Math.max(
    1,
    toNumber(getValue(row, ['số lượng', 'quantity', 'qty', 'sl', 'số sản phẩm']))
  );
  const revenue = toNumber(
    getValue(row, [
      'doanh thu',
      'thành tiền',
      'tong tien',
      'tổng tiền',
      'giá trị đơn',
      'order amount',
      'total amount',
      'subtotal',
      'paid amount',
    ])
  );
  const refundAmount = toNumber(getValue(row, ['hoàn', 'refund', 'return amount', 'hủy', 'cancel']));

  const orderId = firstNonEmpty(
    getValue(row, ['mã đơn', 'ma don', 'order id', 'id đơn hàng', 'order no']),
    randomUUID().slice(0, 8)
  );
  const productName = firstNonEmpty(
    getValue(row, ['tên sản phẩm', 'ten san pham', 'product name', 'item name', 'sku name']),
    'Sản phẩm chưa đặt tên'
  );
  const sku = firstNonEmpty(getValue(row, ['sku', 'mã hàng', 'ma hang', 'seller sku', 'variation']));
  const date = parseDate(getValue(row, ['ngày', 'ngay', 'date', 'created', 'thời gian', 'time']));
  const platformFee = toNumber(getValue(row, ['phí sàn', 'phi san', 'commission', 'transaction fee', 'platform fee', 'service fee']));
  const cogs = toNumber(getValue(row, ['giá vốn', 'gia von', 'cogs', 'cost']));

  return {
    id: randomUUID(),
    importJobId: jobId,
    source,
    channel: sourceLabels[source],
    type: 'order',
    date,
    orderId,
    productName,
    sku,
    status,
    quantity,
    revenue,
    platformFee,
    refundAmount: refundAmount || (status === 'cancelled' || status === 'refunded' ? revenue : 0),
    adsCost: 0,
    cogs,
    raw: row,
  };
}

function normalizeAdsRow(row: Record<string, unknown>, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;
  const adsCost = toNumber(getValue(row, ['chi phí', 'chi phi', 'cost', 'spend', 'amount spent', 'ads cost']));
  const campaignName = firstNonEmpty(getValue(row, ['campaign', 'chiến dịch', 'chien dich', 'tên quảng cáo']), 'Campaign chưa đặt tên');
  const channel = firstNonEmpty(getValue(row, ['nền tảng', 'platform', 'source', 'kênh']), 'Ads');

  return {
    id: randomUUID(),
    importJobId: jobId,
    source: 'ads',
    channel,
    type: 'ads',
    date: parseDate(getValue(row, ['ngày', 'date', 'day', 'thời gian'])),
    campaignName,
    status: 'success',
    quantity: 0,
    revenue: toNumber(getValue(row, ['doanh thu', 'revenue', 'conversion value', 'purchase value'])),
    platformFee: 0,
    refundAmount: 0,
    adsCost,
    cogs: 0,
    raw: row,
  };
}

function normalizeCogsRow(row: Record<string, unknown>, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;
  const productName = firstNonEmpty(getValue(row, ['tên sản phẩm', 'product name', 'item name']), 'Sản phẩm chưa đặt tên');
  const sku = firstNonEmpty(getValue(row, ['sku', 'mã hàng', 'ma hang', 'seller sku']), productName);
  const cogs = toNumber(getValue(row, ['giá vốn', 'gia von', 'cogs', 'cost', 'unit cost']));

  return {
    id: randomUUID(),
    importJobId: jobId,
    source: 'giavon',
    channel: 'Giá vốn',
    type: 'cogs',
    date: parseDate(getValue(row, ['ngày', 'date', 'thời gian'])),
    productName,
    sku,
    status: 'success',
    quantity: 0,
    revenue: 0,
    platformFee: 0,
    refundAmount: 0,
    adsCost: 0,
    cogs,
    raw: row,
  };
}

function getDateRange(records: NormalizedRecord[]) {
  const dates = records.map((record) => record.date).filter(Boolean).sort();
  return {
    from: dates[0],
    to: dates[dates.length - 1],
  };
}

export async function parseImportFile(file: File, source: ImportSource, importedBy = 'Tài khoản'): Promise<ImportResult> {
  const jobId = randomUUID();
  const rows = await readRows(file);
  const errors: string[] = [];
  const records = rows
    .map((row, index) => {
      try {
        if (source === 'ads') return normalizeAdsRow(row, jobId);
        if (source === 'giavon') return normalizeCogsRow(row, jobId);
        return normalizeOrderRow(row, source, jobId);
      } catch (error) {
        errors.push(`Dòng ${index + 2}: ${(error as Error).message}`);
        return null;
      }
    })
    .filter((record): record is NormalizedRecord => record !== null);

  const dateRange = getDateRange(records);
  const job: ImportJob = {
    id: jobId,
    fileName: file.name,
    source,
    sourceLabel: sourceLabels[source],
    dataType: sourceDataTypes[source],
    fileSize: file.size,
    totalRows: rows.length,
    validRows: records.length,
    errorRows: Math.max(rows.length - records.length, errors.length),
    status: records.length > 0 ? 'success' : 'error',
    importedBy,
    importedAt: new Date().toISOString(),
    dateRangeFrom: dateRange.from,
    dateRangeTo: dateRange.to,
    errors: records.length > 0 ? errors.slice(0, 20) : ['Không nhận diện được dòng dữ liệu hợp lệ trong file.'],
    preview: rows.slice(0, 5),
  };

  return { job, records };
}
