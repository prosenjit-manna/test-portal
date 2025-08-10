import { dbPromise } from '@/lib/db';
import { createToken } from '@/lib/actions';

export default async function TokensPage() {
  const db = await dbPromise;
  const users = db.data.users;
  const tokens = db.data.api_tokens;

  async function action(formData: FormData) {
    'use server';
    const userId = String(formData.get('userId')||'');
    const name = String(formData.get('name')||'');
    await createToken(userId, name);
  }

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">API Tokens</h2>
      <form action={action} className="space-y-3 rounded-lg border bg-white p-4">
        <div>
          <label htmlFor="userId" className="mb-1 block text-sm font-medium">User</label>
          <select id="userId" name="userId" className="w-full rounded border px-3 py-2 text-sm" required>
            {users.map(u => (<option key={u.id} value={u.id}>{u.name} ({u.email})</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
          <input id="name" name="name" className="w-full rounded border px-3 py-2 text-sm" required />
        </div>
        <button type="submit" className="rounded bg-black px-3 py-2 text-sm text-white">Create</button>
      </form>
      <div className="divide-y rounded-lg border bg-white">
        {tokens.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">hash: {t.tokenHash}</div>
            </div>
            <div className="text-sm text-gray-600">User: {users.find(u=>u.id===t.userId)?.email}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
