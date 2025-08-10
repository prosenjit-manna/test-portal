import { dbPromise } from '@/lib/db';

export default async function ReportsPage() {
  const db = await dbPromise;
  const results = db.data.results;
  const total = results.length;
  const byStatus = ['passed','failed','blocked','retest','untested'].map(s => ({
    status: s as any,
    count: results.filter(r => r.status === s).length,
  }));
  return (
    <main>
      <h2 className="mb-4 text-lg font-semibold">Reports</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {byStatus.map(s => (
          <div key={s.status} className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">{s.status}</div>
            <div className="text-2xl font-semibold">{s.count}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">Total results: {total}</div>
    </main>
  );
}
