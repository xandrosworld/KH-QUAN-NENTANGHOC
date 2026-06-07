import { NextResponse } from 'next/server';
import type { ImportSource } from '@/lib/data-types';
import { buildImportList } from '@/lib/server/analytics';
import {
  appendImport,
  deleteImport,
  getActiveRecords,
  getDisplayJobs,
  resetImportedData,
} from '@/lib/server/data-store';
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const exportJobId = url.searchParams.get('jobId');
  const format = url.searchParams.get('format');
  const jobs = await getDisplayJobs();

  if (exportJobId && format === 'csv') {
    const job = jobs.find((item) => item.id === exportJobId);

    if (!job) {
      return NextResponse.json({ error: 'Không tìm thấy file import.' }, { status: 404 });
    }

    const records = (await getActiveRecords()).filter((record) => record.importJobId === exportJobId);
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
  const formData = await request.formData();
  const file = formData.get('file');
  const source = formData.get('source');
  const importedBy = typeof formData.get('importedBy') === 'string'
    ? String(formData.get('importedBy'))
    : 'Nguyễn Văn A';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Thiếu file import.' }, { status: 400 });
  }

  if (!isImportSource(source)) {
    return NextResponse.json({ error: 'Nguồn dữ liệu không hợp lệ.' }, { status: 400 });
  }

  let result;
  try {
    result = await parseImportFile(file, source, importedBy);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Không đọc được file import.' },
      { status: 400 },
    );
  }

  await appendImport(result.job, result.records);

  return NextResponse.json({
    job: result.job,
    recordsImported: result.records.length,
    preview: result.job.preview,
  });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (jobId) {
    const deleted = await deleteImport(jobId);

    if (!deleted) {
      return NextResponse.json({ error: 'Không tìm thấy file import trong dữ liệu runtime.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  }

  await resetImportedData();
  return NextResponse.json({ ok: true });
}
