import { seedIfEmpty, dbPromise } from '@/lib/db';

export default async function DashboardPage() {
  await seedIfEmpty();
  const db = await dbPromise;
  const projects = db.data.projects;
  const runs = db.data.runs;
  const passRate = (() => {
    const results = db.data.results;
    if (results.length === 0) return 0;
    const passed = results.filter(r => r.status === 'passed').length;
    return Math.round((passed / results.length) * 100);
  })();

  return (
    <main className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Projects</div>
          <div className="text-2xl font-semibold">{projects.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Runs</div>
          <div className="text-2xl font-semibold">{runs.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Pass rate</div>
          <div className="text-2xl font-semibold">{passRate}%</div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Recent Runs</h2>
        <div className="divide-y rounded-lg border bg-white">
          {runs.slice(-5).map(r => (
            <a key={r.id} href={`/runs/${r.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-gray-500">{r.status}</div>
              </div>
              <div className="text-sm text-gray-600">Project: {projects.find(p=>p.id===r.projectId)?.name}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
