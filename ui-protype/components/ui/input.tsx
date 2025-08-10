import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, Readonly<InputProps>>(function Input(
  { className = '', ...props }, ref
) {
  return (
    <input
      ref={ref}
      className={`block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      {...props}
    />
  );
});
