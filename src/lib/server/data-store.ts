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
import { isDatabaseEnabled, query, withTransaction } from './db';

const dataDir = process.env.TRONX_DATA_DIR ?? path.join(process.cwd(), '.runtime-data');
const jobsFile = path.join(dataDir, 'import-jobs.json');
const recordsFile = path.join(dataDir, 'records.json');

type ImportJobRow = QueryResultRow & {
  id: string;
  owner_user_id: string | null;
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
  owner_user_id: string | null;
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
    ownerUserId: row.owner_user_id ?? undefined,
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
    ownerUserId: row.owner_user_id ?? undefined,
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

function filterJobsByOwner(jobs: ImportJob[], ownerUserId?: string) {
  if (!ownerUserId) return jobs;
  return jobs.filter((job) => job.ownerUserId === ownerUserId);
}

function filterRecordsByOwner(records: NormalizedRecord[], ownerUserId?: string) {
  if (!ownerUserId) return records;
  return records.filter((record) => record.ownerUserId === ownerUserId);
}

export async function getImportedJobs(ownerUserId?: string): Promise<ImportJob[]> {
  if (isDatabaseEnabled()) {
    const result = ownerUserId
      ? await query<ImportJobRow>(
        'SELECT * FROM import_jobs WHERE owner_user_id = $1 ORDER BY imported_at DESC',
        [ownerUserId],
      )
      : await query<ImportJobRow>('SELECT * FROM import_jobs ORDER BY imported_at DESC');
    return result.rows.map(mapImportJob);
  }

  return filterJobsByOwner(await readJson<ImportJob[]>(jobsFile, []), ownerUserId);
}

export async function getImportedRecords(ownerUserId?: string): Promise<NormalizedRecord[]> {
  if (isDatabaseEnabled()) {
    const result = ownerUserId
      ? await query<NormalizedRecordRow>(
        'SELECT * FROM normalized_records WHERE owner_user_id = $1 ORDER BY date DESC, id ASC',
        [ownerUserId],
      )
      : await query<NormalizedRecordRow>('SELECT * FROM normalized_records ORDER BY date DESC, id ASC');
    return result.rows.map(mapNormalizedRecord);
  }

  return filterRecordsByOwner(await readJson<NormalizedRecord[]>(recordsFile, []), ownerUserId);
}

export async function getDisplayJobs(ownerUserId?: string): Promise<ImportJob[]> {
  return getImportedJobs(ownerUserId);
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

function getCanonicalKey(record: NormalizedRecord) {
  if (record.type === 'order' && record.orderId) {
    return [
      'order',
      record.ownerUserId ?? '',
      record.source,
      normalizeIdentity(record.orderId),
      normalizeIdentity(record.sku || record.productName),
      record.status,
    ].join('|');
  }

  if (record.type === 'ads') {
    return [
      'ads',
      record.ownerUserId ?? '',
      record.channel,
      record.date,
      normalizeIdentity(record.campaignName),
      Math.round(record.adsCost),
      Math.round(record.revenue),
    ].join('|');
  }

  if (record.type === 'cogs') {
    return [
      'cogs',
      record.ownerUserId ?? '',
      normalizeIdentity(record.sku || record.productName),
      record.date,
    ].join('|');
  }

  return record.id;
}

function recordCompleteness(record: NormalizedRecord) {
  return Object.keys(record.raw ?? {}).length
    + Number(record.revenue > 0)
    + Number(record.refundAmount > 0)
    + Number(record.platformFee > 0)
    + Number(record.quantity > 0);
}

export function canonicalizeRecords(records: NormalizedRecord[]) {
  const canonical = new Map<string, NormalizedRecord>();

  records.forEach((record) => {
    const key = getCanonicalKey(record);
    const current = canonical.get(key);
    if (!current || recordCompleteness(record) > recordCompleteness(current)) {
      canonical.set(key, record);
    }
  });

  return [...canonical.values()];
}

export async function getActiveRecords(ownerUserId?: string): Promise<NormalizedRecord[]> {
  return canonicalizeRecords(await getImportedRecords(ownerUserId));
}

export async function appendImport(job: ImportJob, records: NormalizedRecord[], ownerUserId?: string) {
  const ownedJob: ImportJob = { ...job, ownerUserId: ownerUserId ?? job.ownerUserId };
  const ownedRecords = records.map((record) => ({
    ...record,
    ownerUserId: ownerUserId ?? record.ownerUserId ?? job.ownerUserId,
  }));

  if (isDatabaseEnabled()) {
    await withTransaction(async (tx) => {
      await tx(
        `
          INSERT INTO import_jobs (
            id, owner_user_id, file_name, source, source_label, data_type, file_size, total_rows,
            valid_rows, error_rows, status, imported_by, imported_at,
            date_range_from, date_range_to, errors, preview
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13,
            $14, $15, $16::jsonb, $17::jsonb
          )
        `,
        [
          ownedJob.id,
          ownedJob.ownerUserId ?? null,
          ownedJob.fileName,
          ownedJob.source,
          ownedJob.sourceLabel,
          ownedJob.dataType,
          ownedJob.fileSize,
          ownedJob.totalRows,
          ownedJob.validRows,
          ownedJob.errorRows,
          ownedJob.status,
          ownedJob.importedBy,
          ownedJob.importedAt,
          ownedJob.dateRangeFrom ?? null,
          ownedJob.dateRangeTo ?? null,
          JSON.stringify(ownedJob.errors),
          JSON.stringify(ownedJob.preview),
        ],
      );

      for (const record of ownedRecords) {
        await tx(
          `
            INSERT INTO normalized_records (
              id, import_job_id, owner_user_id, source, channel, type, date, order_id,
              product_name, sku, campaign_name, status, quantity, revenue,
              platform_fee, refund_amount, ads_cost, cogs, raw
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              $9, $10, $11, $12, $13, $14,
              $15, $16, $17, $18, $19::jsonb
            )
          `,
          [
            record.id,
            record.importJobId,
            record.ownerUserId ?? ownedJob.ownerUserId ?? null,
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
    writeJson(jobsFile, [ownedJob, ...jobs]),
    writeJson(recordsFile, [...ownedRecords, ...existingRecords]),
  ]);
}

export async function deleteImport(jobId: string, ownerUserId?: string) {
  if (isDatabaseEnabled()) {
    const result = ownerUserId
      ? await query('DELETE FROM import_jobs WHERE id = $1 AND owner_user_id = $2', [jobId, ownerUserId])
      : await query('DELETE FROM import_jobs WHERE id = $1', [jobId]);
    return (result.rowCount ?? 0) > 0;
  }

  const [jobs, existingRecords] = await Promise.all([getImportedJobs(), getImportedRecords()]);
  const nextJobs = jobs.filter((job) => job.id !== jobId || (ownerUserId && job.ownerUserId !== ownerUserId));

  if (nextJobs.length === jobs.length) {
    return false;
  }

  await Promise.all([
    writeJson(jobsFile, nextJobs),
    writeJson(recordsFile, existingRecords.filter((record) => record.importJobId !== jobId)),
  ]);

  return true;
}

export async function resetImportedData(ownerUserId?: string) {
  if (isDatabaseEnabled()) {
    await withTransaction(async (tx) => {
      if (ownerUserId) {
        await tx('DELETE FROM normalized_records WHERE owner_user_id = $1', [ownerUserId]);
        await tx('DELETE FROM import_jobs WHERE owner_user_id = $1', [ownerUserId]);
        return;
      }

      await tx('DELETE FROM normalized_records');
      await tx('DELETE FROM import_jobs');
    });
    return;
  }

  await ensureDataDir();
  if (ownerUserId) {
    const [jobs, existingRecords] = await Promise.all([getImportedJobs(), getImportedRecords()]);
    await Promise.all([
      writeJson(jobsFile, jobs.filter((job) => job.ownerUserId !== ownerUserId)),
      writeJson(recordsFile, existingRecords.filter((record) => record.ownerUserId !== ownerUserId)),
    ]);
    return;
  }

  await Promise.all([
    writeJson(jobsFile, []),
    writeJson(recordsFile, []),
  ]);
}
