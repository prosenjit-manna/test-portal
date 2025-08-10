import { dbPromise } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = await dbPromise;
  const run = db.data.runs.find(r => r.id === params.id);
  if (!run) return new Response('not found', { status: 404 });
  const rows = db.data.run_cases
    .filter(rc => rc.runId === run.id)
    .map(rc => {
      const c = db.data.cases.find(x => x.id === rc.caseId);
      const last = [...db.data.results].reverse().find(res => res.runCaseId === rc.id);
      return {
        run: run.name,
        caseTitle: c?.title || 'Unknown',
        status: last?.status || 'untested',
      };
    });
  const header = 'run,caseTitle,status\n';
  const body = rows.map(r => `${escapeCsv(r.run)},${escapeCsv(r.caseTitle)},${escapeCsv(r.status)}`).join('\n');
  const csv = header + body + '\n';
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } });
}

function escapeCsv(v: string) {
  const needs = /[",\n]/.test(v);
  return needs ? '"' + v.replace(/"/g,'""') + '"' : v;
}
