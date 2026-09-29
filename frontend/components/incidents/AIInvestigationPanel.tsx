'use client';

import {
  Bot,
  AlertTriangle,
  CheckSquare,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, getConfidenceBg, getConfidenceColor } from '@/lib/utils';
import type { InvestigationResult } from '@/lib/types';

interface AIInvestigationPanelProps {
  result: InvestigationResult;
  className?: string;
}

export default function AIInvestigationPanel({ result, className }: AIInvestigationPanelProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-blue-900/30 to-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">🤖 AI Recommendation</h3>
              <p className="text-xs text-text-muted">Contextual analysis from IncidentMind</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={result.source === 'live' ? 'info' : 'default'}>
              {result.source === 'live' ? 'Live AI' : 'Demo AI'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[680px] overflow-y-auto">
        {/* Confidence Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-xs text-text-muted uppercase tracking-wide font-medium">Confidence Score</span>
            </div>
            <span className={cn('text-sm font-bold', getConfidenceColor(result.confidenceScore))}>
              {result.confidenceScore}%
            </span>
          </div>
          <div className="h-2.5 bg-surface rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000', getConfidenceBg(result.confidenceScore))}
              style={{ width: `${result.confidenceScore}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted">
            Based on {result.memoryCount} historical {result.memoryCount === 1 ? 'incident' : 'incidents'} in Hindsight
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Incident Summary
          </h4>
          <p className="text-sm text-text-primary leading-relaxed bg-surface rounded-lg p-3 border border-border/60">
            {result.summary}
          </p>
        </div>

        {/* Likely Causes */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            Likely Causes
          </h4>
          <ul className="space-y-1.5">
            {result.likelyCauses.map((cause, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-400 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-text-primary leading-relaxed">{cause}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Investigation Steps */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
            Investigation Steps
          </h4>
          <ol className="space-y-2">
            {result.investigationSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-text-secondary leading-relaxed font-mono text-[12px]">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            Recommended Actions
          </h4>
          <ol className="space-y-2">
            {result.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-text-primary leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Warnings */}
        {result.warnings && result.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Warnings from History
            </h4>
            <div className="space-y-2">
              {result.warnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-amber-300 leading-relaxed">{warning.replace(/^⚠️\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why This Recommendation */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Why This Recommendation?
          </h4>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm text-purple-300 leading-relaxed italic">
              &ldquo;{result.whyThisRecommendation}&rdquo;
            </p>
            <p className="text-[10px] text-purple-400/60 mt-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Powered by Hindsight Memory — {result.memoryCount} incidents recalled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
