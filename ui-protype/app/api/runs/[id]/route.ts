import { NextRequest } from 'next/server';
import { dbPromise } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await dbPromise;
  const run = db.data.runs.find(r => r.id === params.id);
  if (!run) return Response.json({ error: 'not found' }, { status: 404 });
  const runCases = db.data.run_cases.filter(rc => rc.runId === run.id).map(rc => {
    const c = db.data.cases.find(x => x.id === rc.caseId);
    const last = [...db.data.results].reverse().find(res => res.runCaseId === rc.id);
    return { id: rc.id, caseTitle: c?.title || 'Unknown', lastStatus: last?.status };
  });
  return Response.json({ run, runCases });
}
