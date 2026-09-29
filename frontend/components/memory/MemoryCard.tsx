'use client';

import { Brain, CheckCircle, XCircle, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, getSeverityBg, formatRelativeTime } from '@/lib/utils';
import type { Memory } from '@/lib/types';

interface MemoryCardProps {
  memory: Memory;
  variant?: 'default' | 'compact';
}

export default function MemoryCard({ memory, variant = 'default' }: MemoryCardProps) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-xl overflow-hidden',
      'hover:border-purple-500/30 hover:brain-glow transition-all duration-200',
    )}>
      {/* Top accent bar */}
      <div className={cn(
        'h-1',
        memory.outcome === 'Success' ? 'bg-gradient-to-r from-emerald-500 to-blue-500' :
        memory.outcome === 'Partial' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
        'bg-gradient-to-r from-red-500 to-red-700'
      )} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-purple-400">{memory.incidentId}</span>
              <Badge className={cn('text-[10px]', getSeverityBg(memory.severity))}>
                {memory.severity}
              </Badge>
            </div>
            <h4 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {memory.title}
            </h4>
            <p className="text-xs text-text-muted mt-0.5">{memory.service} · {formatRelativeTime(memory.timestamp)}</p>
          </div>
          <Badge variant={memory.outcome === 'Success' ? 'success' : memory.outcome === 'Partial' ? 'warning' : 'danger'}>
            {memory.outcome}
          </Badge>
        </div>

        {/* Root Cause */}
        <div className="p-2.5 bg-surface rounded-lg border border-border/60">
          <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Root Cause</p>
          <p className="text-xs text-amber-300 leading-relaxed">{memory.rootCause}</p>
        </div>

        {/* Resolution */}
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300 leading-relaxed">{memory.resolution}</p>
        </div>

        {/* Failed Approaches */}
        {memory.failedApproaches && memory.failedApproaches.length > 0 && (
          <div className="space-y-1">
            {memory.failedApproaches.map((fa, i) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{fa}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {memory.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-surface border border-border text-text-muted">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] text-text-muted">{memory.resolutionTime} min MTTR</span>
          </div>
          {memory.similarity !== undefined && (
            <span className="text-[10px] text-blue-400 font-medium">{memory.similarity}% match</span>
          )}
        </div>
      </div>
    </div>
  );
}
