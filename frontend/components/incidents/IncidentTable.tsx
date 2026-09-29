'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, getSeverityBg, getStatusBg, formatDate } from '@/lib/utils';
import type { Incident, Severity, Status } from '@/lib/types';

interface IncidentTableProps {
  incidents: Incident[];
}

const STATUS_FILTERS: (Status | 'All')[] = ['All', 'Open', 'Investigating', 'Resolved', 'Partial'];
const SEVERITY_FILTERS: (Severity | 'All')[] = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function IncidentTable({ incidents }: IncidentTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [sortField, setSortField] = useState<keyof Incident>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function toggleSort(field: keyof Incident) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const filtered = incidents
    .filter(i => {
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) &&
          !i.service.toLowerCase().includes(search.toLowerCase()) &&
          !i.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'All' && i.status !== statusFilter) return false;
      if (severityFilter !== 'All' && i.severity !== severityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const av = (a[sortField] ?? '') as string;
      const bv = (b[sortField] ?? '') as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60"
            placeholder="Search incidents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f as Status | 'All')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                statusFilter === f
                  ? 'bg-primary/20 text-primary-bright border-primary/40'
                  : 'border-border text-text-muted hover:text-text-secondary hover:border-border/80'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {SEVERITY_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setSeverityFilter(f as Severity | 'All')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                severityFilter === f
                  ? 'bg-primary/20 text-primary-bright border-primary/40'
                  : 'border-border text-text-muted hover:text-text-secondary hover:border-border/80'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted">Showing {filtered.length} of {incidents.length} incidents</p>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                {[
                  { key: 'id', label: 'ID' },
                  { key: 'title', label: 'Title' },
                  { key: 'service', label: 'Service' },
                  { key: 'severity', label: 'Severity' },
                  { key: 'status', label: 'Status' },
                  { key: 'resolutionTime', label: 'MTTR' },
                  { key: 'createdAt', label: 'Date' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key as keyof Incident)}
                    className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide cursor-pointer hover:text-text-secondary transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : null}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((incident, idx) => (
                <tr
                  key={incident.id}
                  className="hover:bg-surface/50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-blue-400">{incident.id}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-sm text-text-primary font-medium truncate">{incident.title}</p>
                    {incident.rootCause && (
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{incident.rootCause}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-secondary">{incident.service}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-xs', getSeverityBg(incident.severity))}>
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-xs', getStatusBg(incident.status))}>
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-secondary">
                      {incident.resolutionTime ? `${incident.resolutionTime}m` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-muted">{formatDate(incident.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="flex items-center gap-1 text-xs text-primary-bright hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted">No incidents match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
