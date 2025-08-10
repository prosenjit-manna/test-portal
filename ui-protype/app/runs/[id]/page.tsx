'use client';
import * as React from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RunDetail({ params }: { params: { id: string } }) {
  const { data, mutate } = useSWR(`/api/runs/${params.id}`, fetcher);
  const [submitting, setSubmitting] = React.useState<string | null>(null);
  if (!data) return <div className="text-sm text-gray-600">Loading…</div>;
  const { run, runCases } = data;

  const update = async (rcId: string, status: string) => {
    setSubmitting(rcId);
    await fetch(`/api/runs/${params.id}/results`, { method: 'POST', body: JSON.stringify({ runCaseId: rcId, status }) });
    await mutate();
    setSubmitting(null);
  };

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Run: {run.name}</h2>
      <div className="divide-y rounded-lg border bg-white">
        {runCases.map((rc: any) => (
          <div key={rc.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{rc.caseTitle}</div>
              <div className="text-xs text-gray-500">Last: {rc.lastStatus || 'untested'}</div>
            </div>
            <div className="flex gap-2">
              {['passed','failed','blocked','retest','untested'].map(s => (
                <Button key={s} variant={s==='failed'?'destructive':s==='untested'?'secondary':'default'} disabled={submitting===rc.id} onClick={() => update(rc.id, s)}>{s}</Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
