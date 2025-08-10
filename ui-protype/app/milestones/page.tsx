import { dbPromise } from '@/lib/db';

export default async function MilestonesPage() {
  const db = await dbPromise;
  const milestones = db.data.milestones;
  const projects = db.data.projects;
  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold">Milestones</h2>
      <div className="divide-y rounded-lg border bg-white">
        {milestones.map(m => (
          <div key={m.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-gray-500">{m.status}</div>
            </div>
            <div className="text-sm text-gray-600">Project: {projects.find(pr=>pr.id===m.projectId)?.name}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
