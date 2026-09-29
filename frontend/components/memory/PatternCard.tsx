'use client';

import { TrendingUp, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pattern } from '@/lib/types';

interface PatternCardProps {
  pattern: Pattern;
}

export default function PatternCard({ pattern }: PatternCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-blue-500/30 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary leading-snug">{pattern.title}</h4>
        </div>
        <span className="text-xs font-bold text-blue-400 flex-shrink-0">{pattern.confidence}% confidence</span>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed">{pattern.description}</p>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: `${pattern.confidence}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {pattern.services.map(svc => (
          <span key={svc} className="px-2 py-0.5 text-[10px] rounded bg-surface border border-border text-text-muted">
            {svc}
          </span>
        ))}
        {pattern.tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </span>
        ))}
      </div>

      <p className="text-[10px] text-text-muted">Observed {pattern.frequency}x in stored memories</p>
    </div>
  );
}
