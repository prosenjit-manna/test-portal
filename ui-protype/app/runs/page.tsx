import { dbPromise } from '@/lib/db';

export default async function RunsPage() {
  const db = await dbPromise;
  const runs = db.data.runs;
  const projects = db.data.projects;
  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold">Runs</h2>
      <div className="divide-y rounded-lg border bg-white">
        {runs.map(r => {
          const project = projects.find(p => p.id === r.projectId);
          return (
            <div key={r.id} className="flex items-center justify-between p-3">
              <div>
                <a href={`/runs/${r.id}`} className="font-medium hover:underline">{r.name}</a>
                <div className="text-xs text-gray-500">{r.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Project: <a href={`/projects/${project?.id}`} className="text-blue-600 hover:underline">{project?.name}</a>
                </span>
                <a 
                  href={`/runs/${r.id}`}
                  className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                >
                  Execute
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
