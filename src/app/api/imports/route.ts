import { NextResponse } from 'next/server';
import type { ImportSource } from '@/lib/data-types';
import { buildImportList } from '@/lib/server/analytics';
import { appendImport, getDisplayJobs, resetImportedData } from '@/lib/server/data-store';
import { parseImportFile } from '@/lib/server/import-parser';

export const dynamic = 'force-dynamic';

const allowedSources: ImportSource[] = ['shopee', 'tiktok', 'lazada', 'ads', 'giavon'];

function isImportSource(value: unknown): value is ImportSource {
  return typeof value === 'string' && allowedSources.includes(value as ImportSource);
}

export async function GET() {
  const jobs = await getDisplayJobs();
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

export async function DELETE() {
  await resetImportedData();
  return NextResponse.json({ ok: true });
}
