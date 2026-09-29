'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { cn, getSeverityBg } from '@/lib/utils';
import type { IncidentInput, Severity, Environment } from '@/lib/types';

const SERVICES = [
  'Payment API',
  'Auth Service',
  'Redis Cache',
  'Database',
  'API Gateway',
  'Kubernetes',
  'CDN',
  'Third-party API',
];

const SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
const ENVIRONMENTS: Environment[] = ['Production', 'Staging', 'Development'];

interface IncidentFormProps {
  onSubmit: (data: IncidentInput) => void;
  loading?: boolean;
  prefill?: Partial<IncidentInput>;
}

export default function IncidentForm({ onSubmit, loading, prefill }: IncidentFormProps) {
  const [form, setForm] = useState<IncidentInput>({
    title: prefill?.title || '',
    service: prefill?.service || 'Payment API',
    environment: prefill?.environment || 'Production',
    severity: prefill?.severity || 'Critical',
    timestamp: prefill?.timestamp || new Date().toISOString().slice(0, 16),
    errorMessage: prefill?.errorMessage || '',
    logsDescription: prefill?.logsDescription || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof IncidentInput, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof IncidentInput, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.service) newErrors.service = 'Service is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  function set<K extends keyof IncidentInput>(key: K, value: IncidentInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <Input
        label="Incident Title *"
        placeholder="e.g. Payment API High Latency Spike"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        error={errors.title}
      />

      {/* Service + Environment row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Affected Service *"
          value={form.service}
          onChange={e => set('service', e.target.value)}
          error={errors.service}
        >
          {SERVICES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select
          label="Environment"
          value={form.environment}
          onChange={e => set('environment', e.target.value as Environment)}
        >
          {ENVIRONMENTS.map(env => (
            <option key={env} value={env}>{env}</option>
          ))}
        </Select>
      </div>

      {/* Severity + Timestamp row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Severity chips */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Severity
          </label>
          <div className="flex gap-2 flex-wrap">
            {SEVERITIES.map(sev => (
              <button
                type="button"
                key={sev}
                onClick={() => set('severity', sev)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150',
                  form.severity === sev
                    ? getSeverityBg(sev) + ' scale-105'
                    : 'bg-surface border-border text-text-muted hover:border-border/80'
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Timestamp"
          type="datetime-local"
          value={form.timestamp}
          onChange={e => set('timestamp', e.target.value)}
        />
      </div>

      {/* Error Message */}
      <Input
        label="Error Message"
        placeholder="e.g. Connection timeout: could not connect to database after 30s"
        value={form.errorMessage || ''}
        onChange={e => set('errorMessage', e.target.value)}
      />

      {/* Logs / Description */}
      <Textarea
        label="Logs / Description"
        placeholder="Paste relevant log snippets, describe what you're seeing, error codes, affected users, etc."
        value={form.logsDescription || ''}
        onChange={e => set('logsDescription', e.target.value)}
        className="min-h-[130px]"
      />

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-xl shadow-blue-500/20"
        >
          <AlertTriangle className="w-4 h-4" />
          Investigate Incident
        </Button>
      </div>
    </form>
  );
}
