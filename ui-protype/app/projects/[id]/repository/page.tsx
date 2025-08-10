import { dbPromise } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { 
  createSuite, 
  createSection, 
  createCase, 
  deleteSuite, 
  deleteSection,
  bulkUpdateCases,
  bulkDeleteCases,
  duplicateCase
} from '@/lib/actions';
import { CaseFilters, CaseList } from '@/components/CaseManagement';

export default async function Repository({ params, searchParams }: { params: { id: string }; searchParams: { suite?: string; section?: string; priority?: string; type?: string; tag?: string; search?: string } }) {
  const db = await dbPromise;
  const project = db.data.projects.find(p => p.id === params.id);
  if (!project) return notFound();
  const suites = db.data.suites.filter(s => s.projectId === project.id);
  const selectedSuiteId = searchParams.suite || suites[0]?.id;
  const sections = db.data.sections.filter(sec => sec.suiteId === selectedSuiteId);
  const selectedSectionId = searchParams.section || sections[0]?.id || null;
  
  // Filter cases
  let cases = db.data.cases.filter(c => c.suiteId === selectedSuiteId && (selectedSectionId ? c.sectionId === selectedSectionId : true));
  if (searchParams.priority) cases = cases.filter(c => c.priority === searchParams.priority);
  if (searchParams.type) cases = cases.filter(c => c.type === searchParams.type);
  if (searchParams.tag) cases = cases.filter(c => c.tags?.includes(searchParams.tag!));
  if (searchParams.search) cases = cases.filter(c => c.title.toLowerCase().includes(searchParams.search!.toLowerCase()));

  async function addSuite(formData: FormData) {
    'use server';
    const name = String(formData.get('name')||'');
    if (!project) return;
    const id = await createSuite(project.id, name);
    redirect(`/projects/${project.id}/repository?suite=${id}`);
  }
  async function addSection(formData: FormData) {
    'use server';
  const name = String(formData.get('name')||'');
  if (!selectedSuiteId || !project) return;
  const id = await createSection(selectedSuiteId, name);
  redirect(`/projects/${project.id}/repository?suite=${selectedSuiteId}&section=${id}`);
  }
  async function addCase(formData: FormData) {
    'use server';
  const title = String(formData.get('title')||'');
  if (!selectedSuiteId) return;
  const id = await createCase(selectedSuiteId, selectedSectionId || null, title);
    redirect(`/cases/${id}`);
  }
  async function removeSuite(_: FormData) {
    'use server';
  if (!selectedSuiteId || !project) return;
  await deleteSuite(selectedSuiteId);
  redirect(`/projects/${project.id}/repository`);
  }
  async function removeSection(_: FormData) {
    'use server';
  if (!selectedSectionId || !project) return;
  await deleteSection(selectedSectionId);
  redirect(`/projects/${project.id}/repository?suite=${selectedSuiteId}`);
  }

  // CRUD handlers for cases
  const handleBulkUpdate = async (caseIds: string[], updates: { priority?: 'P0' | 'P1' | 'P2' | 'P3'; type?: 'Functional' | 'Regression' | 'Smoke' | 'Other' }) => {
    'use server';
    await bulkUpdateCases(caseIds, updates);
    redirect(`/projects/${params.id}/repository?${new URLSearchParams(searchParams as Record<string, string>).toString()}`);
  };

  const handleDuplicate = async (caseId: string) => {
    'use server';
    await duplicateCase(caseId);
    redirect(`/projects/${params.id}/repository?${new URLSearchParams(searchParams as Record<string, string>).toString()}`);
  };

  const handleDelete = async (caseId: string) => {
    'use server';
    await bulkDeleteCases([caseId]);
    redirect(`/projects/${params.id}/repository?${new URLSearchParams(searchParams as Record<string, string>).toString()}`);
  };

  return (
    <main className="space-y-6">
      <div>
        <div className="mb-2">
          <a href="/projects" className="text-sm text-blue-600 hover:underline">← Back to Projects</a>
        </div>
        <h2 className="text-lg font-semibold">Repository — {project.name}</h2>
      </div>
      
      {/* Navigation Tabs */}
      <nav className="border-b border-gray-200">
        <div className="flex space-x-8">
          <a 
            href={`/projects/${project.id}`}
            className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Overview
          </a>
          <a 
            href={`/projects/${project.id}/repository`}
            className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600"
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <aside className="space-y-4 md:col-span-1">
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 text-sm font-medium">Suites</div>
            <div className="flex flex-col">
              {suites.map(s => (
                <a key={s.id} href={`?suite=${s.id}`} className={`rounded px-2 py-1 text-sm ${s.id===selectedSuiteId?'bg-black text-white':'hover:bg-gray-100'}`}>{s.name}</a>
              ))}
            </div>
            <form action={addSuite} className="mt-3 flex gap-2">
              <input name="name" placeholder="New suite" className="w-full rounded border px-2 py-1 text-sm" required />
              <button className="rounded bg-black px-2 py-1 text-sm text-white">Add</button>
            </form>
            <form action={removeSuite} className="mt-2 text-right">
              <button className="text-xs text-red-600 underline" disabled={!selectedSuiteId}>Delete suite</button>
            </form>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 text-sm font-medium">Sections</div>
            <div className="flex flex-col">
              {sections.map(sec => (
                <a key={sec.id} href={`?suite=${selectedSuiteId}&section=${sec.id}`} className={`rounded px-2 py-1 text-sm ${sec.id===selectedSectionId?'bg-black text-white':'hover:bg-gray-100'}`}>{sec.name}</a>
              ))}
            </div>
            <form action={addSection} className="mt-3 flex gap-2">
              <input name="name" placeholder="New section" className="w-full rounded border px-2 py-1 text-sm" required />
              <button className="rounded bg-black px-2 py-1 text-sm text-white">Add</button>
            </form>
            <form action={removeSection} className="mt-2 text-right">
              <button className="text-xs text-red-600 underline" disabled={!selectedSectionId}>Delete section</button>
            </form>
          </div>
        </aside>
        <section className="space-y-3 md:col-span-2">
          <CaseFilters searchParams={searchParams} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">{cases.length} case(s)</div>
              <a href={`/api/cases?suiteId=${selectedSuiteId}`} className="text-xs text-blue-600 underline">Export CSV</a>
              <form action={async (formData: FormData) => { 
                'use server';
                const file = formData.get('file') as File;
                if (!file || !selectedSuiteId) return;
                // Import would be handled by a separate API endpoint
                // This is a placeholder - in a real app, you'd call the import API
              }} className="flex items-center gap-2">
                <input type="file" accept=".csv" name="file" className="text-xs" />
                <button className="rounded bg-green-600 px-2 py-1 text-xs text-white">Import CSV</button>
              </form>
            </div>
            <form action={addCase} className="flex gap-2">
              <input name="title" placeholder="New case title" className="w-64 rounded border px-2 py-1 text-sm" required />
              <button className="rounded bg-black px-2 py-1 text-sm text-white">Add case</button>
            </form>
          </div>
          <CaseList 
            cases={cases} 
            onBulkUpdate={handleBulkUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </section>
      </div>
    </main>
  );
}
