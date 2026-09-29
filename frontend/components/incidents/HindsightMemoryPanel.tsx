'use client';

import { Brain, Database, Zap, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime, getSeverityBg, getSimilarityColor } from '@/lib/utils';
import type { Memory } from '@/lib/types';

interface HindsightMemoryPanelProps {
  memories: Memory[];
  source: 'live' | 'demo';
  loading?: boolean;
  className?: string;
}

export default function HindsightMemoryPanel({
  memories,
  source,
  loading,
  className,
}: HindsightMemoryPanelProps) {
  if (loading) {
    return (
      <div className={cn('brain-glow bg-card border border-purple-500/30 rounded-xl p-5 animate-pulse', className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20" />
          <div className="h-4 bg-surface rounded w-40" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="mb-3 p-4 bg-surface rounded-xl border border-border space-y-2">
            <div className="h-3 bg-card rounded w-3/4" />
            <div className="h-2 bg-card rounded w-1/2" />
            <div className="h-2 bg-card rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-card border rounded-xl overflow-hidden',
        memories.length > 0
          ? 'border-purple-500/40 brain-glow'
          : 'border-border',
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60 bg-gradient-to-r from-purple-900/30 to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">🧠 Hindsight Memory</h3>
              <p className="text-xs text-text-muted">Relevant past incidents recalled</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={memories.length > 0 ? 'purple' : 'muted'}
              className="text-xs font-bold"
            >
              {memories.length} recalled
            </Badge>
            <Badge variant={source === 'live' ? 'purple' : 'default'}>
              {source === 'live' ? (
                <>
                  <Zap className="w-3 h-3" />
                  Live Hindsight
                </>
              ) : (
                <>
                  <Database className="w-3 h-3" />
                  Demo Memory
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-h-[680px] overflow-y-auto">
        {memories.length === 0 ? (
          <div className="text-center py-10">
            <Brain className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
            <p className="text-sm text-text-muted">No relevant memories found</p>
            <p className="text-xs text-text-muted/70 mt-1">
              This might be a novel incident type. After resolution, it will be stored in Hindsight.
            </p>
          </div>
        ) : (
          memories.map((memory, idx) => (
            <MemoryCard key={memory.id} memory={memory} index={idx} />
          ))
        )}
      </div>

      {/* Footer */}
      {memories.length > 0 && (
        <div className="px-5 py-3 border-t border-border/60 bg-purple-900/10">
          <p className="text-xs text-purple-400/80 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            Powered by Hindsight by Vectorize — semantic memory retrieval
          </p>
        </div>
      )}
    </div>
  );
}

function MemoryCard({ memory, index }: { memory: Memory; index: number }) {
  const similarityColor = getSimilarityColor(memory.similarity ?? 0);
  const severityClass = getSeverityBg(memory.severity);

  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border/60 overflow-hidden',
        'hover:border-purple-500/30 transition-all duration-200',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Memory card top bar */}
      <div className="h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-purple-400">{memory.incidentId}</span>
              <Badge variant="purple" className="text-[10px]">
                {getSeverityBg(memory.severity).includes('red') ? '🔴' :
                 getSeverityBg(memory.severity).includes('orange') ? '🟠' :
                 getSeverityBg(memory.severity).includes('amber') ? '🟡' : '🟢'}
                {memory.severity}
              </Badge>
            </div>
            <p className="text-xs font-medium text-text-primary leading-tight line-clamp-2">
              {memory.title}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {memory.service} · {formatRelativeTime(memory.timestamp)}
            </p>
          </div>

          {/* Similarity */}
          {memory.similarity !== undefined && (
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs font-bold text-text-primary">{memory.similarity}%</span>
              <span className="text-[10px] text-text-muted">match</span>
            </div>
          )}
        </div>

        {/* Similarity bar */}
        {memory.similarity !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted uppercase tracking-wide">Similarity</span>
              <span className={cn('text-[10px] font-semibold', memory.similarity >= 85 ? 'text-emerald-400' : memory.similarity >= 70 ? 'text-blue-400' : 'text-amber-400')}>
                {memory.similarity >= 85 ? 'Strong Match' : memory.similarity >= 70 ? 'Good Match' : 'Partial Match'}
              </span>
            </div>
            <div className="h-1.5 bg-card rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', similarityColor)}
                style={{ width: `${memory.similarity}%` }}
              />
            </div>
          </div>
        )}

        {/* Root Cause */}
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium">Root Cause</p>
          <p className="text-xs text-amber-300 font-medium leading-relaxed">{memory.rootCause}</p>
        </div>

        {/* Resolution */}
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium">What Worked</p>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300 leading-relaxed">{memory.resolution}</p>
          </div>
        </div>

        {/* Failed Approaches */}
        {memory.failedApproaches && memory.failedApproaches.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium">Failed Approaches</p>
            <div className="space-y-1">
              {memory.failedApproaches.map((approach, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed">{approach}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: time + outcome */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] text-text-muted">{memory.resolutionTime} min MTTR</span>
          </div>
          <Badge
            variant={memory.outcome === 'Success' ? 'success' : memory.outcome === 'Partial' ? 'warning' : 'danger'}
            className="text-[10px]"
          >
            {memory.outcome}
          </Badge>
        </div>
      </div>
    </div>
  );
}
