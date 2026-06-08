import { NextResponse } from 'next/server';
import type { ImportJob, ImportSource, NormalizedRecord } from '@/lib/data-types';
import { buildImportList } from '@/lib/server/analytics';
import {
  appendImport,
  deleteImport,
  getActiveRecords,
  getDisplayJobs,
  resetImportedData,
} from '@/lib/server/data-store';
import { requireApiSession } from '@/lib/server/api-auth';
import { parseImportFile } from '@/lib/server/import-parser';

export const dynamic = 'force-dynamic';

const allowedSources: ImportSource[] = ['shopee', 'tiktok', 'lazada', 'ads', 'giavon'];

function isImportSource(value: unknown): value is ImportSource {
  return typeof value === 'string' && allowedSources.includes(value as ImportSource);
}

function toCsvValue(value: unknown) {
  if (value === null || value === undefined) return '';
  const text = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function getNormalizedExportRow(record: Awaited<ReturnType<typeof getActiveRecords>>[number]) {
  return {
    date: record.date,
    source: record.channel,
    type: record.type,
    order_id: record.orderId ?? '',
    product_name: record.productName ?? '',
    sku: record.sku ?? '',
    campaign_name: record.campaignName ?? '',
    status: record.status,
    quantity: record.quantity,
    revenue: record.revenue,
    platform_fee: record.platformFee,
    refund_amount: record.refundAmount,
    ads_cost: record.adsCost,
    cogs: record.cogs,
  };
}

function buildCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return '\uFEFF';
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [
    headers.map(toCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

function safeExportName(fileName: string) {
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  const safe = withoutExt.replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/^-+|-+$/g, '');
  return `${safe || 'tronx-import-data'}.csv`;
}

function normalizeIdentity(value?: string) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getComparableRecordKey(record: NormalizedRecord) {
  if (record.type === 'order' && record.orderId) {
    const lineIdentity = normalizeIdentity(record.sku || record.productName || '');
    return [
      'order',
      record.source,
      record.status,
      normalizeIdentity(record.orderId),
      lineIdentity,
    ].join('|');
  }

  if (record.type === 'ads') {
    return [
      'ads',
      record.channel,
      record.date,
      normalizeIdentity(record.campaignName || ''),
      Math.round(record.adsCost),
      Math.round(record.revenue),
    ].join('|');
  }

  if (record.type === 'cogs') {
    return [
      'cogs',
      normalizeIdentity(record.sku || record.productName || ''),
      Math.round(record.cogs),
    ].join('|');
  }

  return null;
}

function getDuplicateImportError(
  job: ImportJob,
  incomingRecords: NormalizedRecord[],
  existingJobs: ImportJob[],
  existingRecords: NormalizedRecord[],
) {
  const sameFile = existingJobs.find((item) => normalizeIdentity(item.fileName) === normalizeIdentity(job.fileName));
  if (sameFile) {
    return `File "${job.fileName}" đã được import trước đó. Hãy xóa job import cũ rồi import lại nếu muốn thay dữ liệu.`;
  }

  const existingKeys = new Set(existingRecords.map(getComparableRecordKey).filter(Boolean));
  const incomingKeys = incomingRecords.map(getComparableRecordKey).filter(Boolean);
  if (incomingKeys.length === 0) return null;

  const duplicateCount = incomingKeys.filter((key) => existingKeys.has(key)).length;
  const duplicateRate = duplicateCount / incomingKeys.length;

  if (duplicateCount === incomingKeys.length || (incomingKeys.length >= 20 && duplicateRate >= 0.2)) {
    return `Phát hiện ${duplicateCount}/${incomingKeys.length} dòng trùng với dữ liệu đã import. Có thể bạn đang import trùng file, import cả Order.all và Order.completed, hoặc nhập thêm file trạng thái đã nằm trong file trước đó. Hãy xóa dữ liệu trùng, hoặc chỉ chọn một file tổng hợp để import.`;
  }

  return null;
}

export async function GET(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const url = new URL(request.url);
  const exportJobId = url.searchParams.get('jobId');
  const format = url.searchParams.get('format');
  const ownerUserId = auth.session.sub;
  const jobs = await getDisplayJobs(ownerUserId);

  if (exportJobId && format === 'csv') {
    const job = jobs.find((item) => item.id === exportJobId);

    if (!job) {
      return NextResponse.json({ error: 'Không tìm thấy file import.' }, { status: 404 });
    }

    const records = (await getActiveRecords(ownerUserId)).filter((record) => record.importJobId === exportJobId);
    const rawRows = records
      .map((record) => record.raw)
      .filter((row) => Object.keys(row).length > 0 && row.generated !== true);
    const exportRows = rawRows.length > 0
      ? rawRows
      : records.length > 0
        ? records.map(getNormalizedExportRow)
        : job.preview;
    const fileName = safeExportName(job.fileName);

    return new NextResponse(buildCsv(exportRows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  }

  return NextResponse.json(buildImportList(jobs));
}

export async function POST(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const formData = await request.formData();
  const file = formData.get('file');
  const source = formData.get('source');
  const importedBy = typeof formData.get('importedBy') === 'string'
    ? String(formData.get('importedBy'))
    : auth.session.name || auth.session.email;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Thiếu file import.' }, { status: 400 });
  }

  if (!isImportSource(source)) {
    return NextResponse.json({ error: 'Nguồn dữ liệu không hợp lệ.' }, { status: 400 });
  }

  let result;
  try {
    result = await parseImportFile(file, source, auth.session.name || auth.session.email || importedBy);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Không đọc được file import.' },
      { status: 400 },
    );
  }

  const ownerUserId = auth.session.sub;
  result.job.ownerUserId = ownerUserId;
  result.records = result.records.map((record) => ({ ...record, ownerUserId }));

  const [existingJobs, existingRecords] = await Promise.all([
    getDisplayJobs(ownerUserId),
    getActiveRecords(ownerUserId),
  ]);
  const duplicateError = getDuplicateImportError(result.job, result.records, existingJobs, existingRecords);

  if (duplicateError) {
    return NextResponse.json({ error: duplicateError }, { status: 409 });
  }

  await appendImport(result.job, result.records, ownerUserId);

  return NextResponse.json({
    job: result.job,
    recordsImported: result.records.length,
    preview: result.job.preview,
  });
}

export async function DELETE(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');
  const ownerUserId = auth.session.sub;

  if (jobId) {
    const deleted = await deleteImport(jobId, ownerUserId);

    if (!deleted) {
      return NextResponse.json({ error: 'Không tìm thấy file import trong dữ liệu runtime.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  }

  await resetImportedData(ownerUserId);
  return NextResponse.json({ ok: true });
}
