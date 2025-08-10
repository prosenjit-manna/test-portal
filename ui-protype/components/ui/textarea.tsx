import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, Readonly<TextareaProps>>(function Textarea(
  { className = '', ...props }, ref
) {
  return (
    <textarea
      ref={ref}
      className={`block w-full min-h-[80px] rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 ${className}`}
      {...props}
    />
  );
});
