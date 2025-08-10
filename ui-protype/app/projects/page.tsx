import { dbPromise } from '@/lib/db';

export default async function ProjectsPage() {
  const db = await dbPromise;
  const projects = db.data.projects;
  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <a href="/projects/new" className="rounded bg-black px-3 py-1 text-white">New</a>
      </div>
      <div className="divide-y rounded-lg border bg-white">
        {projects.map(p => (
          <a key={p.id} href={`/projects/${p.id}`} className="block p-3 hover:bg-gray-50">
            <div className="font-medium">{p.name} <span className="text-xs text-gray-500">({p.key})</span></div>
            <div className="text-sm text-gray-600">{p.description}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
