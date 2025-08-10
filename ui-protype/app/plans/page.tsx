import { dbPromise } from '@/lib/db';

export default async function PlansPage() {
  const db = await dbPromise;
  const plans = db.data.plans;
  const projects = db.data.projects;
  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold">Plans</h2>
      <div className="divide-y rounded-lg border bg-white">
        {plans.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-500">{p.status}</div>
            </div>
            <div className="text-sm text-gray-600">Project: {projects.find(pr=>pr.id===p.projectId)?.name}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
