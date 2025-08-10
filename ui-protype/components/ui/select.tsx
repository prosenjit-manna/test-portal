import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, Readonly<SelectProps>>(function Select(
  { className = '', children, ...props }, ref
) {
  return (
    <select
      ref={ref}
      className={`block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
