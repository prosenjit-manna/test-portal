import * as React from 'react';

export function Badge({ children, color = 'neutral' }: Readonly<{ children: React.ReactNode; color?: 'neutral'|'green'|'red'|'yellow'|'blue' }>) {
  const bg: Record<string,string> = {
    neutral: 'bg-neutral-100 text-neutral-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
  };
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${bg[color]}`}>{children}</span>;
}
