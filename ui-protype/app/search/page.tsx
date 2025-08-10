import { dbPromise } from '@/lib/db';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q || '').toLowerCase();
  const db = await dbPromise;
  const projects = db.data.projects.filter(p => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));
  const cases = db.data.cases.filter(c => !q || c.title.toLowerCase().includes(q) || (c.tags||[]).some(t => t.toLowerCase().includes(q)));
  return (
    <main className="space-y-6">
      <form className="rounded-lg border bg-white p-3">
        <input name="q" defaultValue={q} placeholder="Search…" className="w-full rounded border px-3 py-2 text-sm" />
      </form>
      <section>
        <h3 className="mb-2 font-medium">Projects</h3>
        <div className="divide-y rounded-lg border bg-white">
          {projects.map(p => (
            <a key={p.id} href={`/projects/${p.id}`} className="block p-3 hover:bg-gray-50">{p.name} <span className="text-xs text-gray-500">({p.key})</span></a>
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-2 font-medium">Cases</h3>
        <div className="divide-y rounded-lg border bg-white">
          {cases.map(c => (
            <a key={c.id} href={`/cases/${c.id}`} className="block p-3 hover:bg-gray-50">{c.title}</a>
          ))}
        </div>
      </section>
    </main>
  );
}
