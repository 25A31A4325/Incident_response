import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'critical';
  label?: string;
  pulse?: boolean;
  className?: string;
}

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

const statusTextColors = {
  online: 'text-emerald-400',
  offline: 'text-slate-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
};

export function StatusIndicator({ status, label, pulse = true, className }: StatusIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              statusColors[status]
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            statusColors[status]
          )}
        />
      </span>
      {label && (
        <span className={cn('text-xs font-medium', statusTextColors[status])}>
          {label}
        </span>
      )}
    </div>
  );
}
