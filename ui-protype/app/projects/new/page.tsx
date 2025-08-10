import { redirect } from 'next/navigation';
import { createProject } from '@/lib/actions';

export default function NewProjectPage() {
  async function action(formData: FormData) {
    'use server';
    const res = await createProject(formData);
    if (res.ok && res.id) redirect(`/projects/${res.id}`);
  }
  return (
    <main className="max-w-xl">
      <h2 className="mb-4 text-lg font-semibold">New Project</h2>
      <form action={action} className="space-y-3 rounded-lg border bg-white p-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
          <input id="name" name="name" className="block w-full rounded border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label htmlFor="key" className="mb-1 block text-sm font-medium">Key</label>
          <input id="key" name="key" className="block w-full rounded border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
          <textarea id="description" name="description" className="block w-full min-h-[80px] rounded border px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded bg-black px-3 py-2 text-sm text-white">Create</button>
      </form>
    </main>
  );
}
