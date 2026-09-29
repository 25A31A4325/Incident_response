'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Brain, ArrowLeft, Zap } from 'lucide-react';
import { getIncident, DEMO_INCIDENTS } from '@/lib/api';
import type { Incident } from '@/lib/types';

const SEV: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'rgba(239,68,68,0.1)',  text: '#fca5a5', border: '#ef4444' },
  high:     { bg: 'rgba(249,115,22,0.1)', text: '#fdba74', border: '#f97316' },
  medium:   { bg: 'rgba(245,158,11,0.1)', text: '#fde68a', border: '#f59e0b' },
  low:      { bg: 'rgba(16,185,129,0.1)', text: '#6ee7b7', border: '#10b981' },
};

export default function IncidentDetailPage() {
  const params = useParams();
  const [inc, setInc] = useState<Incident | null>(null);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    getIncident(id).then(setInc).catch(() => {
      setInc(DEMO_INCIDENTS.find(i => i.id === id) || DEMO_INCIDENTS[0]);
    });
  }, [params]);

  if (!inc) return (
    <div style={{ minHeight:'100vh',background:'#0a0e17',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ color:'#475569' }}>Loading…</div>
    </div>
  );

  const sevKey = (inc.severity as string)?.toLowerCase();
  const sev = SEV[sevKey] || SEV.low;
  const date = inc.createdAt ? new Date(inc.createdAt).toLocaleString() : '—';
  const ai = (inc as any).aiRecommendation;
  const statusColor = { resolved:'#10b981', investigating:'#f59e0b' }[(inc.status as string)?.toLowerCase()] || '#ef4444';

  const Row = ({ label, value, mono }: { label: string; value: any; mono?: boolean }) =>
    value ? (
      <div style={{ display:'grid',gridTemplateColumns:'160px 1fr',gap:12,padding:'10px 0',borderBottom:'1px solid #1e3a5f22' }}>
        <span style={{ fontSize:11,color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px' }}>{label}</span>
        <span style={{ fontSize:13,color:'#e2e8f0',fontFamily:mono?'monospace':'inherit',wordBreak:'break-all' }}>{String(value)}</span>
      </div>
    ) : null;

  return (
    <div style={{ minHeight:'100vh',background:'#0a0e17',color:'#e2e8f0',fontFamily:'system-ui,sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft:240,padding:'32px 28px',maxWidth:900 }}>
        <a href="/incidents" style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:13,color:'#475569',marginBottom:20,textDecoration:'none' }}>
          <ArrowLeft size={13}/> Back to Incidents
        </a>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
              <span style={{ fontSize:12,fontWeight:700,color:'#60a5fa',fontFamily:'monospace' }}>{inc.id}</span>
              <span style={{ padding:'3px 10px',borderRadius:999,fontSize:11,fontWeight:700,textTransform:'uppercase',background:sev.bg,color:sev.text,border:`1px solid ${sev.border}` }}>{inc.severity}</span>
              <span style={{ fontSize:12,color:statusColor,fontWeight:600 }}>● {inc.status}</span>
            </div>
            <h1 style={{ fontSize:22,fontWeight:800,color:'#f1f5f9',margin:0 }}>{inc.title}</h1>
            <p style={{ fontSize:13,color:'#475569',margin:'4px 0 0' }}>{inc.service} · {inc.environment} · {date}</p>
          </div>
          <a href="/incidents/new" style={{ padding:'10px 20px',borderRadius:10,background:'linear-gradient(135deg,#2563eb,#7c3aed)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none' }}>+ New Incident</a>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:24 }}>
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div style={{ background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:14,padding:'22px 24px' }}>
              <h2 style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:14 }}>Incident Details</h2>
              <Row label="Error Message"     value={inc.errorMessage} mono />
              <Row label="Root Cause"        value={inc.rootCause} />
              <Row label="Resolution"        value={inc.resolution} />
              <Row label="Failed Approaches" value={inc.failedApproaches} />
              <Row label="MTTR"              value={inc.resolutionTime ? `${inc.resolutionTime} minutes` : null} />
              <Row label="Environment"       value={inc.environment} />
              <Row label="Status"            value={inc.status} />
              <Row label="Result"            value={inc.resolutionResult} />
            </div>
            {ai && (
              <div style={{ background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:14,padding:'22px 24px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:14 }}>
                  <Zap size={14} color="#60a5fa"/>
                  <span style={{ fontSize:14,fontWeight:700,color:'#60a5fa' }}>AI Recommendation</span>
                  {ai.confidence && <span style={{ marginLeft:'auto',fontSize:12,fontWeight:700,color:Number(ai.confidence)>=80?'#10b981':'#f59e0b' }}>{ai.confidence}% confidence</span>}
                </div>
                {ai.summary && <p style={{ fontSize:13,color:'#cbd5e1',lineHeight:1.7 }}>{ai.summary}</p>}
              </div>
            )}
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <div style={{ background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:14,padding:'18px 20px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:10 }}>
                <Brain size={14} color="#a78bfa"/>
                <span style={{ fontSize:13,fontWeight:700,color:'#a78bfa' }}>Hindsight Memory</span>
              </div>
              <p style={{ fontSize:12,color:'#475569',marginBottom:12 }}>Every resolved incident is stored as a permanent organizational memory.</p>
              <a href="/memory" style={{ display:'block',padding:'9px 14px',borderRadius:9,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',color:'#a78bfa',fontWeight:700,fontSize:12,textDecoration:'none',textAlign:'center' }}>View Memory Explorer →</a>
            </div>
            <div style={{ background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:14,padding:'18px 20px' }}>
              <div style={{ fontSize:13,fontWeight:700,color:'#e2e8f0',marginBottom:12 }}>Quick Actions</div>
              {[{href:'/incidents/new',label:'Report Similar Incident',color:'#3b82f6'},{href:'/analytics',label:'View Analytics',color:'#10b981'},{href:'/timeline',label:'Learning Timeline',color:'#8b5cf6'}].map(a=>(
                <a key={a.href} href={a.href} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',borderRadius:9,background:`${a.color}10`,border:`1px solid ${a.color}25`,color:a.color,fontWeight:600,fontSize:12,textDecoration:'none',marginBottom:8 }}>
                  {a.label} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
