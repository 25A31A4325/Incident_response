import { cn } from '@/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, wrapperClassName, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary',
            'placeholder:text-text-muted',
            'focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30',
            'transition-colors duration-150',
            error && 'border-red-500/60 focus:border-red-500/80',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  className?: string;
  children: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

export function Select({ label, error, wrapperClassName, className, children, ...props }: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary',
          'focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30',
          'transition-colors duration-150 appearance-none cursor-pointer',
          error && 'border-red-500/60',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, wrapperClassName, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary',
            'placeholder:text-text-muted resize-y min-h-[100px]',
            'focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30',
            'transition-colors duration-150',
            error && 'border-red-500/60',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
