'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Brain, Search, Filter, Clock, CheckCircle2, AlertTriangle, Eye, ChevronRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { getIncidents, DEMO_INCIDENTS } from '@/lib/api';
import type { Incident } from '@/lib/types';

const SEV: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'rgba(239,68,68,0.1)',  text: '#fca5a5', border: '#ef4444' },
  high:     { bg: 'rgba(249,115,22,0.1)', text: '#fdba74', border: '#f97316' },
  medium:   { bg: 'rgba(245,158,11,0.1)', text: '#fde68a', border: '#f59e0b' },
  low:      { bg: 'rgba(16,185,129,0.1)', text: '#6ee7b7', border: '#10b981' },
};
const STATUS: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  resolved:     { color: '#10b981', icon: CheckCircle2 },
  open:         { color: '#ef4444', icon: AlertTriangle },
  investigating:{ color: '#f59e0b', icon: Eye },
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIncidents().then(data => {
      // handle both {incidents:[]} and [] shapes
      const list = (data as any).incidents ?? data;
      setIncidents(Array.isArray(list) && list.length > 0 ? list : DEMO_INCIDENTS);
      setLoading(false);
    }).catch(() => { setIncidents(DEMO_INCIDENTS); setLoading(false); });
  }, []);

  const filtered = incidents.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.title?.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q) || i.service?.toLowerCase().includes(q);
    const matchF = filter === 'all' || i.severity === filter || i.status === filter;
    return matchQ && matchF;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: '32px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Incident History</h1>
            <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>{incidents.length} incidents · all stored learnings preserved in Hindsight</p>
          </div>
          <a href="/incidents/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px',
            background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 10, border: 'none',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'none',
          }}>
            + New Incident
          </a>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={13} color="#475569" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search by title, ID, service…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: '#0f1729', border: '1px solid #1e3a5f', borderRadius: 9, padding: '9px 12px 9px 32px', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
          </div>
          {['all','critical','high','medium','low','resolved','open'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid',
              borderColor: filter === f ? '#3b82f6' : '#1e3a5f',
              background: filter === f ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: filter === f ? '#60a5fa' : '#475569',
              textTransform: 'capitalize',
            }}>{f}</button>
          ))}
          <span style={{ fontSize: 12, color: '#334155' }}>{filtered.length} shown</span>
        </div>

        {/* Table */}
        <div style={{ background: '#0f1729', border: '1px solid #1e3a5f', borderRadius: 16, overflow: 'hidden' }}>
          {/* Head */}
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 130px 100px 110px 90px', padding: '11px 20px', background: '#0a0e17', borderBottom: '1px solid #1e293b' }}>
            {['ID','Title / Service','Severity','Status','Time',''].map(h => (
              <span key={h} style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</span>
            ))}
          </div>

          {loading && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#475569' }}>Loading incidents…</div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#475569' }}>No incidents match the filter.</div>
          )}

          {!loading && filtered.map(inc => {
            const sev = SEV[inc.severity?.toLowerCase()] || SEV.low;
            const st  = STATUS[inc.status?.toLowerCase()] || STATUS.open;
            const Icon = st.icon;
            const date = inc.createdAt ? new Date(inc.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—';
            return (
              <div key={inc.id} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr 130px 100px 110px 90px',
                padding: '14px 20px', borderBottom: '1px solid #0a0e1755',
                borderLeft: '3px solid transparent', transition: 'all 0.15s', alignItems: 'center', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(59,130,246,0.04)'; e.currentTarget.style.borderLeftColor='#3b82f6'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderLeftColor='transparent'; }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>{inc.id}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{inc.title}</div>
                  <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{inc.service}</span>
                </div>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px',
                  borderRadius:999, fontSize:11, fontWeight:700, textTransform:'uppercase',
                  background:sev.bg, color:sev.text, border:`1px solid ${sev.border}`,
                }}>{inc.severity}</span>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:st.color, fontWeight:600 }}>
                  <Icon size={13} />{inc.status}
                </span>
                <span style={{ fontSize: 11, color: '#334155' }}>{date}</span>
                <a href={`/incidents/${inc.id}`} style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#60a5fa',fontWeight:600,textDecoration:'none' }}>
                  View <ChevronRight size={12} />
                </a>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
