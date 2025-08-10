import { dbPromise } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const db = await dbPromise;
  const project = db.data.projects.find(p => p.id === params.id);
  if (!project) return notFound();
  const suites = db.data.suites.filter(s => s.projectId === project.id);
  const sections = db.data.sections.filter(sec => suites.some(s => s.id === sec.suiteId));
  const cases = db.data.cases.filter(c => suites.some(s => s.id === c.suiteId));
  return (
    <main className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{project.name} <span className="text-xs text-gray-500">({project.key})</span></h2>
        <p className="text-sm text-gray-600">{project.description}</p>
      </div>
      <section>
        <h3 className="mb-2 font-medium">Suites</h3>
        <div className="divide-y rounded-lg border bg-white">
          {suites.map(s => (
            <details key={s.id} className="p-3">
              <summary className="cursor-pointer font-medium">{s.name}</summary>
              <div className="mt-2 text-sm text-gray-600">{s.description}</div>
              <div className="mt-3">
                {(sections.filter(sec => sec.suiteId === s.id)).map(sec => (
                  <div key={sec.id} className="mb-3 rounded border p-2">
                    <div className="font-medium">{sec.name}</div>
                    <ul className="mt-1 list-disc pl-6 text-sm text-gray-700">
                      {cases.filter(c => c.sectionId === sec.id).map(c => (
                        <li key={c.id}><a className="hover:underline" href={`/cases/${c.id}`}>{c.title}</a></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
