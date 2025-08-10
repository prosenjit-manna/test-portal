import * as React from 'react';

type Variant = 'default' | 'secondary' | 'ghost' | 'destructive';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default: 'bg-black text-white hover:bg-neutral-800',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
  ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({ className = '', variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
