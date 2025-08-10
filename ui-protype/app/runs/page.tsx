import { dbPromise } from '@/lib/db';

export default async function RunsPage() {
  const db = await dbPromise;
  const runs = db.data.runs;
  const projects = db.data.projects;
  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold">Runs</h2>
      <div className="divide-y rounded-lg border bg-white">
        {runs.map(r => (
          <a key={r.id} href={`/runs/${r.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-gray-500">{r.status}</div>
            </div>
            <div className="text-sm text-gray-600">Project: {projects.find(p=>p.id===r.projectId)?.name}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
