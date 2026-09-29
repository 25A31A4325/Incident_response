import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}

export function Card({ children, className, glow, hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-5',
        glow && 'brain-glow border-purple-500/30',
        hover && 'hover:border-primary/40 hover:bg-card/80 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-sm font-semibold text-text-primary', className)}>
      {children}
    </h3>
  );
}
