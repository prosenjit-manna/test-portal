import { dbPromise } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CaseEditor } from '@/components/CaseEditor';

export default async function CaseDetail({ params }: { params: { id: string } }) {
  const db = await dbPromise;
  const c = db.data.cases.find(x => x.id === params.id);
  if (!c) return notFound();
  const steps = db.data.case_steps.filter(s => s.caseId === c.id).sort((a,b)=>a.index-b.index).map(s => ({ action: s.action, expected: s.expected }));
  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">Edit Case</h2>
      <CaseEditor
        caseId={c.id}
        initialTitle={c.title}
        initialDescription={c.description}
        initialPreconditions={c.preconditions}
        initialSteps={steps}
      />
    </main>
  );
}
