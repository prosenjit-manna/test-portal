import { dbPromise } from '@/lib/db';
import { notFound } from 'next/navigation';
import { RunExecutor } from '@/components/RunExecutor';

export default async function RunDetail({ params }: { params: { id: string } }) {
  const db = await dbPromise;
  const run = db.data.runs.find(r => r.id === params.id);
  if (!run) return notFound();
  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Run: {run.name}</h2>
        <div className="text-sm text-gray-600">Status: {run.status}</div>
      </div>
      <RunExecutor runId={run.id} />
      <div>
        <a href={`/api/runs/${run.id}/export`} className="text-sm text-blue-600 underline">Export CSV</a>
      </div>
    </main>
  );
}
