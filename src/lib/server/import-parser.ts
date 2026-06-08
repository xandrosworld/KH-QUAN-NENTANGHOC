import { randomUUID } from 'crypto';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { readSheet } from 'read-excel-file/node';
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

const headerMarkers = [
  'ma don hang',
  'order id',
  'return order id',
  'order status',
  'trang thai don hang',
  'sku san pham',
  'sku phan loai hang',
  'seller sku',
  'sku id',
  'ten san pham',
  'product name',
  'so luong',
  'quantity',
  'gia uu dai',
  'tong so tien nguoi mua thanh toan',
  'tong gia tri don hang',
  'sku subtotal after discount',
  'order amount',
  'chi phi',
  'doanh so',
  'roas',
  'ten dich vu hien thi',
  'ten chien dich',
  'ten phien live',
  'theo ngay',
];

function removeDiacritics(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D');
}

function normalizeHeader(value: string) {
  return removeDiacritics(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function isCellEmpty(value: unknown) {
  return toStringValue(value) === '';
}

function parseDelimitedRows(content: string, delimiter: string) {
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

    if (char === delimiter && !quoted) {
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
  return rows;
}

function scoreHeaderRow(row: unknown[]) {
  const cells = row.map((cell) => normalizeHeader(toStringValue(cell))).filter(Boolean);
  const markerHits = headerMarkers.reduce(
    (sum, marker) => sum + (cells.some((cell) => cell === marker || cell.includes(marker)) ? 1 : 0),
    0,
  );
  return markerHits * 10 + Math.min(cells.length, 8);
}

function findHeaderIndex(rows: unknown[][]) {
  let bestIndex = 0;
  let bestScore = -1;

  rows.slice(0, 30).forEach((row, index) => {
    const score = scoreHeaderRow(row);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 10 ? bestIndex : 0;
}

function parseCsv(content: string): Record<string, unknown>[] {
  const variants = [',', '\t', ';'].map((delimiter) => parseDelimitedRows(content, delimiter));
  const rows = variants
    .filter((variant) => variant.length > 0)
    .sort((a, b) => scoreHeaderRow(b[findHeaderIndex(b)] ?? []) - scoreHeaderRow(a[findHeaderIndex(a)] ?? []))[0];

  return rowsToObjects(rows ?? []);
}

function repairXlsxDimensions(buffer: Buffer) {
  try {
    const zip = unzipSync(new Uint8Array(buffer));
    let changed = false;

    for (const name of Object.keys(zip)) {
      if (!name.startsWith('xl/worksheets/') || !name.endsWith('.xml')) continue;

      const xml = strFromU8(zip[name]);
      const nextXml = xml
        .replace(/<dimension\b[^>]*\/>/g, '')
        .replace(/<dimension\b[^>]*>\s*<\/dimension>/g, '')
        .replace(/<c\b(?=[^>]*\bt="str")[^>]*>\s*<\/c>/g, '')
        .replace(/<c\b(?=[^>]*\bt="inlineStr")[^>]*>\s*<\/c>/g, '');

      if (nextXml !== xml) {
        zip[name] = strToU8(nextXml);
        changed = true;
      }
    }

    return changed ? Buffer.from(zipSync(zip)) : buffer;
  } catch {
    return buffer;
  }
}

function rowsToObjects(sheetRows: unknown[][]): Record<string, unknown>[] {
  if (sheetRows.length === 0) return [];

  const headerIndex = findHeaderIndex(sheetRows);
  const headers = sheetRows[headerIndex].map((cell, index) => toStringValue(cell) || `Column ${index + 1}`);

  return sheetRows
    .slice(headerIndex + 1)
    .map((cells) => {
      const item: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        item[header] = cells[index] ?? '';
      });
      return item;
    })
    .filter((row) => !isRowEmpty(row) && !isHelperRow(row));
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

  const fixedBuffer = repairXlsxDimensions(Buffer.from(arrayBuffer));
  const data = await readSheet(fixedBuffer) as unknown;
  const sheetRows = Array.isArray(data) && data.length > 0 && Array.isArray(data[0])
    ? data as unknown[][]
    : Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null && 'data' in data[0]
      ? (data[0] as { data: unknown[][] }).data
      : [];

  return rowsToObjects(sheetRows);
}

function getEntries(row: Record<string, unknown>, candidates: string[], exactOnly = false) {
  const normalizedCandidates = candidates.map(normalizeHeader);
  return Object.entries(row).filter(([key]) => {
    const normalizedKey = normalizeHeader(key);
    return normalizedCandidates.some((candidate) => (
      exactOnly
        ? normalizedKey === candidate
        : normalizedKey === candidate || normalizedKey.includes(candidate)
    ));
  });
}

function getValue(row: Record<string, unknown>, candidates: string[]) {
  const exact = getEntries(row, candidates, true)[0];
  if (exact) return exact[1];
  return getEntries(row, candidates, false)[0]?.[1];
}

function getLastValue(row: Record<string, unknown>, candidates: string[]) {
  const exact = getEntries(row, candidates, true);
  if (exact.length > 0) return exact[exact.length - 1][1];
  const loose = getEntries(row, candidates, false);
  return loose[loose.length - 1]?.[1];
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = toStringValue(value);
  if (!raw) return 0;

  const cleaned = raw
    .replace(/\s/g, '')
    .replace(/[₫đĐ]/g, '')
    .replace(/vnd/gi, '')
    .replace(/[^0-9,.-]/g, '');

  if (!cleaned) return 0;

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  let normalized = cleaned;

  if (hasComma && hasDot) {
    normalized = cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '');
  } else if (hasComma) {
    normalized = /^\d{1,3}(,\d{3})+$/.test(cleaned)
      ? cleaned.replace(/,/g, '')
      : cleaned.replace(',', '.');
  } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, '');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getNumber(row: Record<string, unknown>, candidates: string[]) {
  return toNumber(getValue(row, candidates));
}

function sumNumbers(row: Record<string, unknown>, candidates: string[]) {
  return candidates.reduce((sum, candidate) => sum + Math.abs(toNumber(getValue(row, [candidate]))), 0);
}

function parseDate(value: unknown) {
  const raw = toStringValue(value);
  if (!raw) return new Date().toISOString().slice(0, 10);

  const isoMatch = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    const date = new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  const localMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (localMatch) {
    const day = Number(localMatch[1]);
    const month = Number(localMatch[2]);
    const year = Number(localMatch[3].length === 2 ? `20${localMatch[3]}` : localMatch[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  const directDate = new Date(raw);
  if (!Number.isNaN(directDate.getTime())) return directDate.toISOString().slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

function parseStatus(...values: unknown[]): NormalizedOrderStatus {
  const normalized = normalizeHeader(values.map(toStringValue).filter(Boolean).join(' '));
  if (!normalized) return 'success';
  if (/(tra hang|hoan tien|refund|return|chap thuan yeu cau|yeu cau cho xu ly)/.test(normalized)) return 'refunded';
  if (/(huy|cancel|canceled|cancelled)/.test(normalized)) return 'cancelled';
  if (/(hoan thanh|da hoan tat|thanh cong|completed|delivered|da giao|success)/.test(normalized)) return 'success';
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
  return Object.values(row).every(isCellEmpty);
}

function isHelperRow(row: Record<string, unknown>) {
  const joinedValues = Object.values(row).slice(0, 16).map((value) => normalizeHeader(toStringValue(value))).join(' ');
  return (
    joinedValues.includes('platform unique order id') ||
    joinedValues.includes('current order status') ||
    joinedValues.includes('product information shown to customers') ||
    joinedValues.includes('sku id generated by tiktok')
  );
}

function baseRecord(jobId: string, source: ImportSource, row: Record<string, unknown>) {
  return {
    id: randomUUID(),
    importJobId: jobId,
    source,
    channel: sourceLabels[source],
    raw: row,
  };
}

function normalizeShopeeOrderRow(row: Record<string, unknown>, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;

  const returnStatus = getValue(row, ['trang thai tra hang hoan tien']);
  const returnedQuantity = toNumber(getValue(row, ['so luong san pham duoc hoan tra']));
  const status = returnStatus || returnedQuantity > 0
    ? 'refunded'
    : parseStatus(getValue(row, ['trang thai don hang']));
  const quantity = Math.max(1, getNumber(row, ['so luong', 'quantity', 'qty']));
  const lineRevenue = getNumber(row, ['tong so tien nguoi mua thanh toan']) || (getNumber(row, ['gia uu dai']) * quantity);
  const platformFee = sumNumbers(row, ['phi co dinh', 'phi dich vu', 'phi xu ly giao dich']);

  return {
    ...baseRecord(jobId, 'shopee', row),
    channel: 'Shopee',
    type: 'order',
    date: parseDate(firstNonEmpty(
      getValue(row, ['thoi gian hoan thanh don hang']),
      getValue(row, ['thoi gian don hang duoc thanh toan']),
      getValue(row, ['ngay dat hang']),
    )),
    orderId: firstNonEmpty(getValue(row, ['ma don hang']), randomUUID().slice(0, 8)),
    productName: firstNonEmpty(getValue(row, ['ten san pham']), 'Sản phẩm chưa đặt tên'),
    sku: firstNonEmpty(getValue(row, ['sku phan loai hang']), getValue(row, ['sku san pham'])),
    status,
    quantity,
    revenue: lineRevenue,
    platformFee,
    refundAmount: status === 'cancelled' || status === 'refunded' ? lineRevenue : 0,
    adsCost: 0,
    cogs: 0,
  };
}

function getShopeeOrderRevenue(row: Record<string, unknown>) {
  return (
    toNumber(getLastValue(row, ['tong so tien nguoi mua thanh toan'])) ||
    getNumber(row, ['tong gia tri don hang vnd']) ||
    getNumber(row, ['tong gia tri don hang'])
  );
}

function distributeShopeeOrderAmounts(records: NormalizedRecord[]) {
  const groups = new Map<string, NormalizedRecord[]>();
  records.forEach((record) => {
    const key = record.orderId || record.id;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  });

  groups.forEach((group) => {
    const orderRevenue = group.map((record) => getShopeeOrderRevenue(record.raw)).find((value) => value > 0) ?? 0;
    const orderFee = group.map((record) => record.platformFee).find((value) => value > 0) ?? 0;
    const lineTotal = group.reduce((sum, record) => sum + Math.max(record.revenue, 0), 0);

    group.forEach((record) => {
      const weight = lineTotal > 0 ? Math.max(record.revenue, 0) / lineTotal : 1 / group.length;
      if (orderRevenue > 0) record.revenue = orderRevenue * weight;
      record.platformFee = orderFee * weight;
      if (record.status === 'cancelled' || record.status === 'refunded') record.refundAmount = record.revenue;
    });
  });

  return records;
}

function normalizeTikTokReturnRow(row: Record<string, unknown>, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;

  const quantity = Math.max(1, getNumber(row, ['return quantity', 'quantity']));
  const refundAmount = (
    getNumber(row, ['order refund amount']) ||
    (getNumber(row, ['return unit price']) * quantity) ||
    getNumber(row, ['order amount'])
  );

  return {
    ...baseRecord(jobId, 'tiktok', row),
    channel: 'TikTok Shop',
    type: 'order',
    date: parseDate(firstNonEmpty(getValue(row, ['refund time']), getValue(row, ['time requested']), getValue(row, ['created time']))),
    orderId: firstNonEmpty(getValue(row, ['order id']), getValue(row, ['return order id']), randomUUID().slice(0, 8)),
    productName: firstNonEmpty(getValue(row, ['product name']), getValue(row, ['sku name']), 'Sản phẩm chưa đặt tên'),
    sku: firstNonEmpty(getValue(row, ['seller sku']), getValue(row, ['sku id'])),
    status: 'refunded',
    quantity,
    revenue: refundAmount,
    platformFee: 0,
    refundAmount,
    adsCost: 0,
    cogs: 0,
  };
}

function normalizeTikTokOrderRow(row: Record<string, unknown>, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;
  if (getValue(row, ['return order id'])) return normalizeTikTokReturnRow(row, jobId);

  const refundAmount = getNumber(row, ['order refund amount']);
  const status = refundAmount > 0
    ? 'refunded'
    : parseStatus(
      getValue(row, ['order status']),
      getValue(row, ['order substatus']),
      getValue(row, ['cancelation return type']),
    );
  const quantity = Math.max(1, getNumber(row, ['quantity', 'sku quantity']));
  const revenue = (
    getNumber(row, ['sku subtotal after discount']) ||
    getNumber(row, ['sku subtotal before discount']) ||
    getNumber(row, ['order amount'])
  );

  return {
    ...baseRecord(jobId, 'tiktok', row),
    channel: 'TikTok Shop',
    type: 'order',
    date: parseDate(firstNonEmpty(
      getValue(row, ['delivered time']),
      getValue(row, ['paid time']),
      getValue(row, ['shipped time']),
      getValue(row, ['created time']),
    )),
    orderId: firstNonEmpty(getValue(row, ['order id']), randomUUID().slice(0, 8)),
    productName: firstNonEmpty(getValue(row, ['product name']), getValue(row, ['sku name']), 'Sản phẩm chưa đặt tên'),
    sku: firstNonEmpty(getValue(row, ['seller sku']), getValue(row, ['sku id'])),
    status,
    quantity,
    revenue,
    platformFee: 0,
    refundAmount: refundAmount || (status === 'cancelled' || status === 'refunded' ? revenue : 0),
    adsCost: 0,
    cogs: 0,
  };
}

function normalizeGenericOrderRow(row: Record<string, unknown>, source: ImportSource, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;

  const status = parseStatus(getValue(row, ['trang thai', 'status', 'order status', 'tinh trang']));
  const quantity = Math.max(1, getNumber(row, ['so luong', 'quantity', 'qty', 'sl', 'so san pham']));
  const revenue = getNumber(row, [
    'doanh thu',
    'thanh tien',
    'tong tien',
    'gia tri don',
    'order amount',
    'total amount',
    'paid amount',
    'subtotal',
  ]);
  const refundAmount = getNumber(row, ['hoan tien', 'refund', 'return amount', 'huy', 'cancel']);

  return {
    ...baseRecord(jobId, source, row),
    type: 'order',
    date: parseDate(getValue(row, ['ngay', 'date', 'created', 'thoi gian', 'time'])),
    orderId: firstNonEmpty(getValue(row, ['ma don', 'order id', 'id don hang', 'order no']), randomUUID().slice(0, 8)),
    productName: firstNonEmpty(getValue(row, ['ten san pham', 'product name', 'item name', 'sku name']), 'Sản phẩm chưa đặt tên'),
    sku: firstNonEmpty(getValue(row, ['seller sku', 'sku', 'ma hang', 'variation'])),
    status,
    quantity,
    revenue,
    platformFee: getNumber(row, ['phi san', 'commission', 'transaction fee', 'platform fee', 'service fee']),
    refundAmount: refundAmount || (status === 'cancelled' || status === 'refunded' ? revenue : 0),
    adsCost: 0,
    cogs: getNumber(row, ['gia von', 'cogs', 'cost']),
  };
}

function inferAdsChannel(row: Record<string, unknown>, fileName: string) {
  const explicit = firstNonEmpty(getValue(row, ['nen tang', 'platform', 'source', 'kenh']));
  if (explicit) return explicit;

  const normalizedFile = normalizeHeader(fileName);
  const normalizedRow = normalizeHeader(Object.values(row).slice(0, 8).map(toStringValue).join(' '));

  if (normalizedFile.includes('shopee') || normalizedRow.includes('shopee')) return 'Shopee Ads';
  if (normalizedFile.includes('live') || normalizedRow.includes('live')) return 'TikTok Live';
  if (normalizedFile.includes('tiktok') || normalizedRow.includes('tiktok')) return 'TikTok Ads';
  return 'Ads';
}

function normalizeAdsRow(row: Record<string, unknown>, jobId: string, fileName: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;

  const adsCost = getNumber(row, ['chi phi rong']) || getNumber(row, ['chi phi', 'cost', 'spend', 'amount spent', 'ads cost']);
  const campaignName = firstNonEmpty(
    getValue(row, ['ten dich vu hien thi']),
    getValue(row, ['ten phien live']),
    getValue(row, ['ten chien dich']),
    getValue(row, ['campaign']),
    getValue(row, ['id chien dich']),
    'Campaign chưa đặt tên',
  );

  return {
    ...baseRecord(jobId, 'ads', row),
    channel: inferAdsChannel(row, fileName),
    type: 'ads',
    date: parseDate(firstNonEmpty(getValue(row, ['theo ngay']), getValue(row, ['thoi gian ra mat']), getValue(row, ['ngay bat dau']), getValue(row, ['ngay', 'date', 'day']))),
    campaignName,
    status: 'success',
    quantity: 0,
    revenue: getNumber(row, ['doanh thu gop cua hang hien tai']) || getNumber(row, ['doanh thu gop', 'doanh so', 'revenue', 'conversion value', 'purchase value']),
    platformFee: 0,
    refundAmount: 0,
    adsCost,
    cogs: 0,
  };
}

function normalizeCogsRow(row: Record<string, unknown>, jobId: string): NormalizedRecord | null {
  if (isRowEmpty(row)) return null;
  const productName = firstNonEmpty(getValue(row, ['ten san pham', 'product name', 'item name']), 'Sản phẩm chưa đặt tên');
  const sku = firstNonEmpty(getValue(row, ['seller sku', 'sku', 'ma hang']), productName);
  const cogs = getNumber(row, ['gia von', 'cogs', 'cost', 'unit cost']);

  return {
    ...baseRecord(jobId, 'giavon', row),
    channel: 'Giá vốn',
    type: 'cogs',
    date: parseDate(getValue(row, ['ngay', 'date', 'thoi gian'])),
    productName,
    sku,
    status: 'success',
    quantity: 0,
    revenue: 0,
    platformFee: 0,
    refundAmount: 0,
    adsCost: 0,
    cogs,
  };
}

function normalizeOrderRow(row: Record<string, unknown>, source: ImportSource, jobId: string): NormalizedRecord | null {
  if (source === 'shopee') return normalizeShopeeOrderRow(row, jobId);
  if (source === 'tiktok') return normalizeTikTokOrderRow(row, jobId);
  return normalizeGenericOrderRow(row, source, jobId);
}

function postProcessRecords(records: NormalizedRecord[], source: ImportSource) {
  if (source === 'shopee') return distributeShopeeOrderAmounts(records);
  return records;
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
  const records = postProcessRecords(
    rows
      .map((row, index) => {
        try {
          if (source === 'ads') return normalizeAdsRow(row, jobId, file.name);
          if (source === 'giavon') return normalizeCogsRow(row, jobId);
          return normalizeOrderRow(row, source, jobId);
        } catch (error) {
          errors.push(`Dòng ${index + 2}: ${(error as Error).message}`);
          return null;
        }
      })
      .filter((record): record is NormalizedRecord => record !== null),
    source,
  );

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
