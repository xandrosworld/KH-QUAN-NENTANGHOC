import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

declare global {
  var __tronxPgPool: Pool | undefined;
  var __tronxPgSchemaReady: Promise<void> | undefined;
}

const schemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Admin',
      avatar_data_url TEXT,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      email_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    )
  `,
  `CREATE INDEX IF NOT EXISTS users_email_idx ON users (LOWER(email))`,
  `
    CREATE TABLE IF NOT EXISTS email_otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      purpose TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      otp_salt TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  `CREATE INDEX IF NOT EXISTS email_otps_lookup_idx ON email_otps (LOWER(email), purpose, created_at DESC)`,
  `
    CREATE TABLE IF NOT EXISTS import_jobs (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      source TEXT NOT NULL,
      source_label TEXT NOT NULL,
      data_type TEXT NOT NULL,
      file_size BIGINT NOT NULL DEFAULT 0,
      total_rows INTEGER NOT NULL DEFAULT 0,
      valid_rows INTEGER NOT NULL DEFAULT 0,
      error_rows INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      imported_by TEXT NOT NULL,
      imported_at TIMESTAMPTZ NOT NULL,
      date_range_from DATE,
      date_range_to DATE,
      errors JSONB NOT NULL DEFAULT '[]'::jsonb,
      preview JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `,
  `CREATE INDEX IF NOT EXISTS import_jobs_imported_at_idx ON import_jobs (imported_at DESC)`,
  `
    CREATE TABLE IF NOT EXISTS normalized_records (
      id TEXT PRIMARY KEY,
      import_job_id TEXT NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
      source TEXT NOT NULL,
      channel TEXT NOT NULL,
      type TEXT NOT NULL,
      date DATE NOT NULL,
      order_id TEXT,
      product_name TEXT,
      sku TEXT,
      campaign_name TEXT,
      status TEXT NOT NULL,
      quantity NUMERIC NOT NULL DEFAULT 0,
      revenue NUMERIC NOT NULL DEFAULT 0,
      platform_fee NUMERIC NOT NULL DEFAULT 0,
      refund_amount NUMERIC NOT NULL DEFAULT 0,
      ads_cost NUMERIC NOT NULL DEFAULT 0,
      cogs NUMERIC NOT NULL DEFAULT 0,
      raw JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `,
  `CREATE INDEX IF NOT EXISTS normalized_records_job_idx ON normalized_records (import_job_id)`,
  `CREATE INDEX IF NOT EXISTS normalized_records_date_idx ON normalized_records (date)`,
  `CREATE INDEX IF NOT EXISTS normalized_records_source_idx ON normalized_records (source)`,
];

export function isDatabaseEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!global.__tronxPgPool) {
    const ssl =
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
        : undefined;

    global.__tronxPgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    });
  }

  return global.__tronxPgPool;
}

async function runSchema() {
  const pool = getPool();
  for (const statement of schemaStatements) {
    await pool.query(statement);
  }
}

export async function ensureDatabaseSchema() {
  if (!isDatabaseEnabled()) return;

  global.__tronxPgSchemaReady ??= runSchema();
  await global.__tronxPgSchemaReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  await ensureDatabaseSchema();
  return getPool().query<T>(text, [...params]);
}

export async function withTransaction<T>(
  callback: (
    queryClient: <R extends QueryResultRow = QueryResultRow>(
      text: string,
      params?: readonly unknown[],
    ) => Promise<QueryResult<R>>,
  ) => Promise<T>,
) {
  await ensureDatabaseSchema();
  const client: PoolClient = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback((text, params = []) => client.query(text, [...params]));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
