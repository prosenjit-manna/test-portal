'use client';
import useSWR from 'swr';
import * as React from 'react';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Status = 'passed' | 'failed' | 'blocked' | 'retest' | 'untested';

export function RunExecutor({ runId }: Readonly<{ runId: string }>) {
  const { data, isLoading, mutate } = useSWR<{ run: any; runCases: { id: string; caseTitle: string; lastStatus?: Status }[] }>(`/api/runs/${runId}`, fetcher);
  const [q, setQ] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<Status | 'all'>('all');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const runCases = React.useMemo(() => {
    let list = data?.runCases || [];
    if (q) list = list.filter(x => x.caseTitle.toLowerCase().includes(q.toLowerCase()));
    if (statusFilter !== 'all') list = list.filter(x => (x.lastStatus || 'untested') === statusFilter);
    return list;
  }, [data, q, statusFilter]);

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const mark = async (status: Status, ids?: string[]) => {
    const targets = ids ?? Array.from(selected);
    await Promise.all(targets.map(id => fetch(`/api/runs/${runId}/results`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runCaseId: id, status })
    })));
    setSelected(new Set());
    mutate();
  };

  if (isLoading) return <div className="text-sm text-gray-600">Loading run…</div>;
  if (!data) return <div className="text-sm text-red-600">Run not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search cases…" className="w-64 rounded border px-3 py-1.5 text-sm" />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="rounded border px-3 py-1.5 text-sm">
          <option value="all">All statuses</option>
          {(['passed','failed','blocked','retest','untested'] as Status[]).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" onClick={()=>mark('passed')}>Mark Passed</Button>
          <Button variant="secondary" onClick={()=>mark('failed')}>Mark Failed</Button>
          <Button variant="secondary" onClick={()=>mark('blocked')}>Mark Blocked</Button>
          <Button variant="secondary" onClick={()=>mark('retest')}>Mark Retest</Button>
          <Button variant="secondary" onClick={()=>mark('untested')}>Reset</Button>
        </div>
      </div>
      <div className="divide-y rounded-lg border bg-white">
        {runCases.map(rc => (
          <div key={rc.id} className="flex items-center justify-between p-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={selected.has(rc.id)} onChange={()=>toggleSelect(rc.id)} />
              <span className="font-medium">{rc.caseTitle}</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{rc.lastStatus || 'untested'}</span>
              <Button variant="ghost" onClick={()=>mark('passed',[rc.id])}>Pass</Button>
              <Button variant="ghost" onClick={()=>mark('failed',[rc.id])}>Fail</Button>
              <Button variant="ghost" onClick={()=>mark('blocked',[rc.id])}>Block</Button>
              <Button variant="ghost" onClick={()=>mark('retest',[rc.id])}>Retest</Button>
              <Button variant="ghost" onClick={()=>mark('untested',[rc.id])}>Reset</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
