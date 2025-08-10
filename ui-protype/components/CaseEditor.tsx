'use client';
import * as React from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { updateCase } from '@/lib/actions';

export function CaseEditor({
  caseId,
  initialTitle,
  initialDescription,
  initialPreconditions,
  initialSteps,
  initialPriority,
  initialType,
  initialTags,
}: Readonly<{ caseId: string; initialTitle: string; initialDescription?: string; initialPreconditions?: string; initialSteps: { action: string; expected: string }[]; initialPriority?: 'P0'|'P1'|'P2'|'P3'; initialType?: 'Functional'|'Regression'|'Smoke'|'Other'; initialTags?: string[] }>) {
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDescription || '');
  const [pre, setPre] = React.useState(initialPreconditions || '');
  const [steps, setSteps] = React.useState(initialSteps);
  const [priority, setPriority] = React.useState(initialPriority || 'P2');
  const [type, setType] = React.useState(initialType || 'Functional');
  const [tags, setTags] = React.useState((initialTags||[]).join(', '));
  const [saving, setSaving] = React.useState(false);
  const addStep = () => setSteps(prev => [...prev, { action: '', expected: '' }]);
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i));
  const onSave = async () => {
    setSaving(true);
    await updateCase(caseId, { title, description, preconditions: pre, priority, type, tags: tags.split(',').map(t=>t.trim()).filter(Boolean) }, steps);
    setSaving(false);
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Preconditions</label>
        <Textarea value={pre} onChange={e => setPre(e.target.value)} />
      </div>
      <div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Priority</label>
            <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="w-full rounded border px-3 py-2 text-sm">
              {(['P0','P1','P2','P3'] as const).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full rounded border px-3 py-2 text-sm">
              {(['Functional','Regression','Smoke','Other'] as const).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tags (comma separated)</label>
            <Input value={tags} onChange={e=>setTags(e.target.value)} />
          </div>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Steps</span>
          <Button type="button" onClick={addStep} variant="secondary">Add step</Button>
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-md border p-2">
              <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">Action</label>
                  <Input value={s.action} onChange={e => setSteps(prev => prev.map((x, idx) => idx === i ? { ...x, action: e.target.value } : x))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Expected</label>
                  <Input value={s.expected} onChange={e => setSteps(prev => prev.map((x, idx) => idx === i ? { ...x, expected: e.target.value } : x))} />
                </div>
              </div>
              <div className="text-right">
                <Button type="button" variant="ghost" onClick={() => removeStep(i)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Button type="button" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </div>
  );
}
