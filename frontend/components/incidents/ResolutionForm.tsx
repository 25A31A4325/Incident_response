'use client';

import { useState } from 'react';
import { Brain, CheckCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { ResolutionInput, ResolutionResult, FeedbackRating } from '@/lib/types';

interface ResolutionFormProps {
  onSubmit: (data: ResolutionInput) => void;
  loading?: boolean;
  success?: boolean;
}

const FEEDBACK_OPTIONS: { value: FeedbackRating; label: string; color: string }[] = [
  { value: 'Yes', label: '👍 Yes, very helpful', color: 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400' },
  { value: 'Partially', label: '🤔 Partially helpful', color: 'border-amber-500/60 bg-amber-500/20 text-amber-400' },
  { value: 'No', label: '👎 Not helpful', color: 'border-red-500/60 bg-red-500/20 text-red-400' },
];

export default function ResolutionForm({ onSubmit, loading, success }: ResolutionFormProps) {
  const [form, setForm] = useState<ResolutionInput>({
    rootCause: '',
    resolution: '',
    failedApproaches: '',
    result: 'Resolved',
    resolutionTime: 0,
    feedbackRating: 'Yes',
  });

  function set<K extends keyof ResolutionInput>(key: K, value: ResolutionInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center animate-fade-in">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-emerald-400 mb-2">
          ✓ Incident Learning Stored in Hindsight
        </h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
          This resolution has been stored in Hindsight memory. Future similar incidents will benefit from this experience — the AI will recall this fix and avoid the approaches that failed.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-purple-400">Hindsight memory updated</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-purple-300 leading-relaxed">
          This resolution will be stored in Hindsight memory and used to improve future incident recommendations.
          Be as specific as possible.
        </p>
      </div>

      {/* Root Cause + Resolution */}
      <Input
        label="Actual Root Cause *"
        placeholder="e.g. Database connection pool exhaustion caused by long-running analytics queries"
        value={form.rootCause}
        onChange={e => set('rootCause', e.target.value)}
      />

      <Textarea
        label="Resolution Applied *"
        placeholder="e.g. Increased connection pool size from 10 to 50, killed long-running queries, added connection timeout"
        value={form.resolution}
        onChange={e => set('resolution', e.target.value)}
        className="min-h-[90px]"
      />

      <Textarea
        label="Failed Approaches (optional)"
        placeholder="e.g. Service restart (didn't help), horizontal scaling (wasted time)"
        value={form.failedApproaches || ''}
        onChange={e => set('failedApproaches', e.target.value)}
        className="min-h-[70px]"
      />

      {/* Result + Time row */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Result"
          value={form.result}
          onChange={e => set('result', e.target.value as ResolutionResult)}
        >
          <option value="Resolved">✅ Resolved</option>
          <option value="Partial">⚠️ Partially Resolved</option>
          <option value="Unresolved">❌ Unresolved</option>
        </Select>

        <Input
          label="Resolution Time (minutes)"
          type="number"
          min={0}
          value={form.resolutionTime || ''}
          onChange={e => set('resolutionTime', parseInt(e.target.value) || 0)}
          placeholder="e.g. 18"
        />
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Was the AI Recommendation Helpful?
        </label>
        <div className="flex gap-3 flex-wrap">
          {FEEDBACK_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('feedbackRating', opt.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-150',
                form.feedbackRating === opt.value
                  ? opt.color + ' scale-105'
                  : 'border-border bg-surface text-text-muted hover:text-text-secondary'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        loading={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 shadow-xl shadow-purple-500/20"
      >
        <Save className="w-4 h-4" />
        Save Learning to Hindsight
        <Brain className="w-4 h-4" />
      </Button>
    </form>
  );
}
