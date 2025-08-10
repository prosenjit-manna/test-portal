import * as React from 'react';

export function Card({ children, className = '' }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={`rounded-lg border bg-white ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={`border-b px-4 py-3 ${className}`}>{children}</div>;
}
export function CardContent({ children, className = '' }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>;
}
