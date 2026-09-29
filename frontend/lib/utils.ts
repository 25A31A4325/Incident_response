import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Severity, Status } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'Critical': return 'text-red-400';
    case 'High': return 'text-orange-400';
    case 'Medium': return 'text-amber-400';
    case 'Low': return 'text-emerald-400';
    default: return 'text-slate-400';
  }
}

export function getSeverityBg(severity: Severity): string {
  switch (severity) {
    case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function getSeverityBorder(severity: Severity): string {
  switch (severity) {
    case 'Critical': return 'border-l-red-500';
    case 'High': return 'border-l-orange-500';
    case 'Medium': return 'border-l-amber-500';
    case 'Low': return 'border-l-emerald-500';
    default: return 'border-l-slate-500';
  }
}

export function getStatusBg(status: Status): string {
  switch (status) {
    case 'Open': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Investigating': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Partial': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  }
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-orange-400';
}

export function getConfidenceBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-orange-500';
}

export function getSimilarityColor(similarity: number): string {
  if (similarity >= 85) return 'bg-emerald-500';
  if (similarity >= 70) return 'bg-blue-500';
  if (similarity >= 50) return 'bg-amber-500';
  return 'bg-slate-500';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
