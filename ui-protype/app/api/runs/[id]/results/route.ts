import { dbPromise } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { runCaseId, status } = body as { runCaseId: string; status: string };
  const db = await dbPromise;
  const rc = db.data.run_cases.find(x => x.id === runCaseId && x.runId === params.id);
  if (!rc) return Response.json({ error: 'not found' }, { status: 404 });
  db.data.results.push({ id: crypto.randomUUID(), runCaseId: rc.id, status: status as any, createdBy: 'system', createdAt: new Date().toISOString() });
  await db.write();
  return Response.json({ ok: true });
}
