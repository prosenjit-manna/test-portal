import { dbPromise } from '@/lib/db';
import { createWebhook } from '@/lib/actions';

export default async function WebhooksPage({ params }: { params: { id: string } }) {
  const db = await dbPromise;
  const project = db.data.projects.find(p => p.id === params.id);
  if (!project) return <div className="text-sm text-red-600">Project not found</div>;
  const hooks = db.data.webhooks.filter(w => w.projectId === project.id);

  async function action(formData: FormData) {
    'use server';
    const url = String(formData.get('url')||'');
    const events = (formData.getAll('events') as string[]) || [];
    if (!project) return;
    await createWebhook(project.id, url, events);
  }

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Webhooks for {project.name}</h2>
      <form action={action} className="space-y-3 rounded-lg border bg-white p-4">
        <div>
          <label htmlFor="url" className="mb-1 block text-sm font-medium">URL</label>
          <input id="url" name="url" className="w-full rounded border px-3 py-2 text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['run.started','run.completed','result.recorded'].map(e => (
            <label key={e} className="flex items-center gap-2"><input type="checkbox" name="events" value={e} /> {e}</label>
          ))}
        </div>
        <button type="submit" className="rounded bg-black px-3 py-2 text-sm text-white">Add webhook</button>
      </form>
      <div className="divide-y rounded-lg border bg-white">
        {hooks.map(h => (
          <div key={h.id} className="p-3">
            <div className="font-medium">{h.url}</div>
            <div className="text-xs text-gray-500">events: {h.events.join(', ')}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
