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
        <div className="mb-2">
          <a href="/projects" className="text-sm text-blue-600 hover:underline">← Back to Projects</a>
        </div>
        <h2 className="text-lg font-semibold">{project.name} <span className="text-xs text-gray-500">({project.key})</span></h2>
        <p className="text-sm text-gray-600">{project.description}</p>
      </div>
      
      {/* Navigation Tabs */}
      <nav className="border-b border-gray-200">
        <div className="flex space-x-8">
          <a 
            href={`/projects/${project.id}`}
            className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
          >
            Overview
          </a>
          <a 
            href={`/projects/${project.id}/repository`}
            className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Repository
          </a>
          <a 
            href={`/projects/${project.id}/webhooks`}
            className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Webhooks
          </a>
        </div>
      </nav>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Test Suites Overview</h3>
          <a 
            href={`/projects/${project.id}/repository`}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            Manage Tests
          </a>
        </div>
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
