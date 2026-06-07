import { promises as fs } from 'fs';
import path from 'path';
import type { ImportJob, NormalizedRecord } from '@/lib/data-types';
import { getSeedRecords, seedImportJobs } from './seed-data';

const dataDir = process.env.TRONX_DATA_DIR ?? path.join(process.cwd(), '.runtime-data');
const jobsFile = path.join(dataDir, 'import-jobs.json');
const recordsFile = path.join(dataDir, 'records.json');

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
  return readJson<ImportJob[]>(jobsFile, []);
}

export async function getImportedRecords(): Promise<NormalizedRecord[]> {
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
  const [jobs, existingRecords] = await Promise.all([getImportedJobs(), getImportedRecords()]);
  await Promise.all([
    writeJson(jobsFile, [job, ...jobs]),
    writeJson(recordsFile, [...records, ...existingRecords]),
  ]);
}

export async function resetImportedData() {
  await ensureDataDir();
  await Promise.all([
    writeJson(jobsFile, []),
    writeJson(recordsFile, []),
  ]);
}
