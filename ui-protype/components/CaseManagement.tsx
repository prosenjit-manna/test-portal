'use client';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export function CaseFilters({ searchParams }: Readonly<{ searchParams: { priority?: string; type?: string; search?: string } }>) {
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [priority, setPriority] = React.useState(searchParams.priority || '');
  const [type, setType] = React.useState(searchParams.type || '');

  const updateUrl = React.useCallback((key: string, value: string) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
  }, []);

  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="mb-3 text-sm font-medium">Filters</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateUrl('search', e.target.value);
          }}
          placeholder="Search cases..." 
          className="rounded border px-2 py-1 text-sm"
        />
        <select 
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            updateUrl('priority', e.target.value);
          }}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="">All priorities</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
        <select 
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            updateUrl('type', e.target.value);
          }}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="">All types</option>
          <option value="Functional">Functional</option>
          <option value="Regression">Regression</option>
          <option value="Smoke">Smoke</option>
          <option value="Other">Other</option>
        </select>
        <button 
          onClick={() => {
            setSearch('');
            setPriority('');
            setType('');
            const url = new URL(window.location.href);
            url.searchParams.delete('search');
            url.searchParams.delete('priority');
            url.searchParams.delete('type');
            window.history.replaceState({}, '', url);
          }}
          className="rounded border px-2 py-1 text-center text-sm text-gray-600 hover:bg-gray-50"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}

export function CaseList({ cases, onDelete, onBulkUpdate, onDuplicate }: Readonly<{ 
  cases: any[]; 
  onDelete?: (id: string) => void;
  onBulkUpdate?: (ids: string[], updates: { priority?: 'P0' | 'P1' | 'P2' | 'P3'; type?: 'Functional' | 'Regression' | 'Smoke' | 'Other' }) => void;
  onDuplicate?: (id: string) => void;
}>) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const priorityColor = (p?: string) => {
    switch(p) {
      case 'P0': return 'red';
      case 'P1': return 'yellow'; 
      case 'P2': return 'blue';
      case 'P3': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-yellow-50 p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button 
            onClick={() => {
              if (onDelete) {
                const selectedIds = Array.from(selected);
                selectedIds.forEach(id => onDelete(id));
                setSelected(new Set());
              }
            }}
            className="rounded bg-red-600 px-2 py-1 text-xs text-white"
          >
            Delete
          </button>
          <select 
            onChange={(e) => {
              if (e.target.value && onBulkUpdate) {
                onBulkUpdate(Array.from(selected), { priority: e.target.value as 'P0' | 'P1' | 'P2' | 'P3' });
                setSelected(new Set());
                e.target.value = '';
              }
            }}
            className="rounded border px-2 py-1 text-xs"
          >
            <option value="">Change priority...</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>
          <select 
            onChange={(e) => {
              if (e.target.value && onBulkUpdate) {
                onBulkUpdate(Array.from(selected), { type: e.target.value as 'Functional' | 'Regression' | 'Smoke' | 'Other' });
                setSelected(new Set());
                e.target.value = '';
              }
            }}
            className="rounded border px-2 py-1 text-xs"
          >
            <option value="">Change type...</option>
            <option value="Functional">Functional</option>
            <option value="Regression">Regression</option>
            <option value="Smoke">Smoke</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}
      <div className="divide-y rounded-lg border bg-white">
        {cases.map(c => (
          <div key={c.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selected.has(c.id)}
                onChange={() => toggleSelect(c.id)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <a className="font-medium hover:underline" href={`/cases/${c.id}`}>{c.title}</a>
                  <Badge color={priorityColor(c.priority)}>{c.priority || 'P2'}</Badge>
                  <Badge color="neutral">{c.type || 'Functional'}</Badge>
                </div>
                {c.tags && c.tags.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {c.tags.map((tag: string) => (
                      <Badge key={tag} color="blue">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onDuplicate?.(c.id)}
                className="text-xs text-blue-600 underline"
              >
                Duplicate
              </button>
              <button 
                onClick={() => onDelete?.(c.id)}
                className="text-xs text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
