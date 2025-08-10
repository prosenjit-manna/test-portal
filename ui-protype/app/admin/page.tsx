import { dbPromise } from '@/lib/db';

export default async function AdminPage() {
  const db = await dbPromise;
  const users = db.data.users;
  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold">Admin</h2>
      <div className="divide-y rounded-lg border bg-white">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </div>
            <div className="text-sm text-gray-600">Role: {u.role}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
