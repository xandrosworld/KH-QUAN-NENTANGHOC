import { promises as fs } from 'fs';
import path from 'path';
import type { QueryResultRow } from 'pg';
import type {
  ImportJob,
  ImportSource,
  NormalizedOrderStatus,
  NormalizedRecord,
  NormalizedRecordType,
} from '@/lib/data-types';
import { getSeedRecords, seedImportJobs } from './seed-data';
import { isDatabaseEnabled, query, withTransaction } from './db';

const dataDir = process.env.TRONX_DATA_DIR ?? path.join(process.cwd(), '.runtime-data');
const jobsFile = path.join(dataDir, 'import-jobs.json');
const recordsFile = path.join(dataDir, 'records.json');

type ImportJobRow = QueryResultRow & {
  id: string;
  file_name: string;
  source: ImportSource;
  source_label: string;
  data_type: string;
  file_size: string | number;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  status: ImportJob['status'];
  imported_by: string;
  imported_at: Date | string;
  date_range_from: Date | string | null;
  date_range_to: Date | string | null;
  errors: string[];
  preview: Record<string, unknown>[];
};

type NormalizedRecordRow = QueryResultRow & {
  id: string;
  import_job_id: string;
  source: ImportSource;
  channel: string;
  type: NormalizedRecordType;
  date: Date | string;
  order_id: string | null;
  product_name: string | null;
  sku: string | null;
  campaign_name: string | null;
  status: NormalizedOrderStatus;
  quantity: string | number;
  revenue: string | number;
  platform_fee: string | number;
  refund_amount: string | number;
  ads_cost: string | number;
  cogs: string | number;
  raw: Record<string, unknown>;
};

function toDateString(value?: Date | string | null) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value);
}

function mapImportJob(row: ImportJobRow): ImportJob {
  return {
    id: row.id,
    fileName: row.file_name,
    source: row.source,
    sourceLabel: row.source_label,
    dataType: row.data_type,
    fileSize: toNumber(row.file_size),
    totalRows: row.total_rows,
    validRows: row.valid_rows,
    errorRows: row.error_rows,
    status: row.status,
    importedBy: row.imported_by,
    importedAt: toIsoString(row.imported_at),
    dateRangeFrom: toDateString(row.date_range_from),
    dateRangeTo: toDateString(row.date_range_to),
    errors: Array.isArray(row.errors) ? row.errors : [],
    preview: Array.isArray(row.preview) ? row.preview : [],
  };
}

function mapNormalizedRecord(row: NormalizedRecordRow): NormalizedRecord {
  return {
    id: row.id,
    importJobId: row.import_job_id,
    source: row.source,
    channel: row.channel,
    type: row.type,
    date: toDateString(row.date) ?? new Date().toISOString().slice(0, 10),
    orderId: row.order_id ?? undefined,
    productName: row.product_name ?? undefined,
    sku: row.sku ?? undefined,
    campaignName: row.campaign_name ?? undefined,
    status: row.status,
    quantity: toNumber(row.quantity),
    revenue: toNumber(row.revenue),
    platformFee: toNumber(row.platform_fee),
    refundAmount: toNumber(row.refund_amount),
    adsCost: toNumber(row.ads_cost),
    cogs: toNumber(row.cogs),
    raw: row.raw ?? {},
  };
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJson<T>(filePath: string, value: T) {
  await ensureDataDir();
  const tmpPath = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(tmpPath, filePath);
}

export async function getImportedJobs(): Promise<ImportJob[]> {
  if (isDatabaseEnabled()) {
    const result = await query<ImportJobRow>('SELECT * FROM import_jobs ORDER BY imported_at DESC');
    return result.rows.map(mapImportJob);
  }

  return readJson<ImportJob[]>(jobsFile, []);
}

export async function getImportedRecords(): Promise<NormalizedRecord[]> {
  if (isDatabaseEnabled()) {
    const result = await query<NormalizedRecordRow>('SELECT * FROM normalized_records ORDER BY date DESC, id ASC');
    return result.rows.map(mapNormalizedRecord);
  }

  return readJson<NormalizedRecord[]>(recordsFile, []);
}

export async function getDisplayJobs(): Promise<ImportJob[]> {
  const jobs = await getImportedJobs();
  return jobs.length > 0 ? jobs : seedImportJobs;
}

export async function getActiveRecords(): Promise<NormalizedRecord[]> {
  const records = await getImportedRecords();
  return records.length > 0 ? records : getSeedRecords();
}

export async function appendImport(job: ImportJob, records: NormalizedRecord[]) {
  if (isDatabaseEnabled()) {
    await withTransaction(async (tx) => {
      await tx(
        `
          INSERT INTO import_jobs (
            id, file_name, source, source_label, data_type, file_size, total_rows,
            valid_rows, error_rows, status, imported_by, imported_at,
            date_range_from, date_range_to, errors, preview
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12,
            $13, $14, $15::jsonb, $16::jsonb
          )
        `,
        [
          job.id,
          job.fileName,
          job.source,
          job.sourceLabel,
          job.dataType,
          job.fileSize,
          job.totalRows,
          job.validRows,
          job.errorRows,
          job.status,
          job.importedBy,
          job.importedAt,
          job.dateRangeFrom ?? null,
          job.dateRangeTo ?? null,
          JSON.stringify(job.errors),
          JSON.stringify(job.preview),
        ],
      );

      for (const record of records) {
        await tx(
          `
            INSERT INTO normalized_records (
              id, import_job_id, source, channel, type, date, order_id,
              product_name, sku, campaign_name, status, quantity, revenue,
              platform_fee, refund_amount, ads_cost, cogs, raw
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7,
              $8, $9, $10, $11, $12, $13,
              $14, $15, $16, $17, $18::jsonb
            )
          `,
          [
            record.id,
            record.importJobId,
            record.source,
            record.channel,
            record.type,
            record.date,
            record.orderId ?? null,
            record.productName ?? null,
            record.sku ?? null,
            record.campaignName ?? null,
            record.status,
            record.quantity,
            record.revenue,
            record.platformFee,
            record.refundAmount,
            record.adsCost,
            record.cogs,
            JSON.stringify(record.raw),
          ],
        );
      }
    });
    return;
  }

  const [jobs, existingRecords] = await Promise.all([getImportedJobs(), getImportedRecords()]);
  await Promise.all([
    writeJson(jobsFile, [job, ...jobs]),
    writeJson(recordsFile, [...records, ...existingRecords]),
  ]);
}

export async function deleteImport(jobId: string) {
  if (isDatabaseEnabled()) {
    const result = await query('DELETE FROM import_jobs WHERE id = $1', [jobId]);
    return (result.rowCount ?? 0) > 0;
  }

  const [jobs, existingRecords] = await Promise.all([getImportedJobs(), getImportedRecords()]);
  const nextJobs = jobs.filter((job) => job.id !== jobId);

  if (nextJobs.length === jobs.length) {
    return false;
  }

  await Promise.all([
    writeJson(jobsFile, nextJobs),
    writeJson(recordsFile, existingRecords.filter((record) => record.importJobId !== jobId)),
  ]);

  return true;
}

export async function resetImportedData() {
  if (isDatabaseEnabled()) {
    await withTransaction(async (tx) => {
      await tx('DELETE FROM normalized_records');
      await tx('DELETE FROM import_jobs');
    });
    return;
  }

  await ensureDataDir();
  await Promise.all([
    writeJson(jobsFile, []),
    writeJson(recordsFile, []),
  ]);
}
