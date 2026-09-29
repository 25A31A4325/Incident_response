'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Brain, CheckCircle2, XCircle, Clock, Search, Filter, Zap, Database } from 'lucide-react';
import { getMemories, DEMO_MEMORIES } from '@/lib/api';
import type { Memory } from '@/lib/types';

const PATTERNS = [
  { icon:'💳', title:'Payment API Latency → DB Pool Exhaustion', confidence:94, incidents:3, desc:'Payment API latency incidents frequently correlate with DB connection pool saturation. Skip service restart — fix pool size and missing indexes simultaneously.' },
  { icon:'🔐', title:'Auth Failures → JWT Secret Rotation',       confidence:88, incidents:2, desc:'Auth service failures often follow JWT secret rotation events. Always implement dual-secret overlap window during rotation to prevent mass logout.' },
  { icon:'📦', title:'Redis OOM → Thundering Herd',              confidence:82, incidents:4, desc:'Redis restart after OOM causes a thundering herd problem. Update eviction policy before increasing memory to prevent cascade DB load.' },
  { icon:'🚀', title:'Deployment Crash → Missing Config',         confidence:91, incidents:5, desc:'Deployment failures correlate with missing env vars or secrets in target namespace. Rollback first, then add missing config.' },
  { icon:'🌐', title:'Third-party Outage → No Circuit Breaker',  confidence:79, incidents:2, desc:'Third-party API outages show 4× longer MTTR without circuit breakers. Implement fallback before next event.' },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'memories'|'patterns'>('memories');

  useEffect(()=>{
    getMemories().then(d=>{
      setMemories(Array.isArray(d)&&d.length>0?d:DEMO_MEMORIES);
      setLoading(false);
    }).catch(()=>{ setMemories(DEMO_MEMORIES); setLoading(false); });
  },[]);

  const filtered = memories.filter(m => {
    const q = search.toLowerCase();
    return !q || m.title?.toLowerCase().includes(q) || m.rootCause?.toLowerCase().includes(q) || m.service?.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e17', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft:240, padding:'32px 28px' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:40,height:40,borderRadius:12,background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 20px rgba(139,92,246,0.3)' }}>
              <Brain size={20} color="#a78bfa"/>
            </div>
            <div>
              <h1 style={{ fontSize:24, fontWeight:800, color:'#f1f5f9', margin:0 }}>Hindsight Memory</h1>
              <p style={{ fontSize:13, color:'#475569', margin:0 }}>All stored incident learnings · powered by Vectorize</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
          {[
            { label:'Total Memories',    value: memories.length || 128, color:'#a78bfa', icon:Brain },
            { label:'Successful Fixes',  value: '94',                    color:'#10b981', icon:CheckCircle2 },
            { label:'Failed Approaches', value: '23',                    color:'#ef4444', icon:XCircle },
            { label:'Avg MTTR',          value: '18m',                   color:'#f59e0b', icon:Clock },
          ].map(s=>{
            const Icon=s.icon;
            return(
              <div key={s.label} style={{ background:'#0f1729',border:`1px solid ${s.color}25`,borderRadius:14,padding:'18px 20px',boxShadow:`0 0 16px ${s.color}12` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                  <span style={{ fontSize:10,color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px' }}>{s.label}</span>
                  <Icon size={14} color={s.color}/>
                </div>
                <div style={{ fontSize:30,fontWeight:900,color:s.color }}>{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,marginBottom:20,background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:11,padding:4,width:'fit-content' }}>
          {(['memories','patterns'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'8px 20px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,
              background:tab===t?'rgba(59,130,246,0.15)':'transparent',
              color:tab===t?'#60a5fa':'#475569',
              outline:tab===t?'1px solid rgba(59,130,246,0.25)':'none',
            }}>{t==='memories'?'🧠 Stored Memories':'📈 Learned Patterns'}</button>
          ))}
        </div>

        {tab === 'memories' && (
          <>
            {/* Search */}
            <div style={{ position:'relative', marginBottom:20, maxWidth:400 }}>
              <Search size={13} color="#475569" style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)' }}/>
              <input type="text" placeholder="Search memories…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{ width:'100%',background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:9,padding:'9px 12px 9px 32px',color:'#e2e8f0',fontSize:13,outline:'none' }}/>
            </div>

            {loading && <div style={{ color:'#475569',padding:32 }}>Loading memories…</div>}

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
              {filtered.map((mem,i)=>(
                <div key={mem.id||i} style={{
                  background:'#0f1729',border:'1px solid rgba(139,92,246,0.2)',borderRadius:14,overflow:'hidden',
                  transition:'all 0.2s',cursor:'default',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(139,92,246,0.45)';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 28px rgba(0,0,0,0.2)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(139,92,246,0.2)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}
                >
                  {/* Top bar */}
                  <div style={{ height:3,background:'linear-gradient(90deg,#8b5cf6,#3b82f6)' }}/>
                  <div style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                      <span style={{ fontSize:11,fontWeight:700,color:'#a78bfa',fontFamily:'monospace' }}>{mem.incidentId||mem.id}</span>
                      {mem.similarity&&<span style={{ fontSize:10,color:'#10b981',fontWeight:700 }}>{mem.similarity}% match</span>}
                    </div>
                    <p style={{ fontSize:13,fontWeight:600,color:'#e2e8f0',marginBottom:4,lineHeight:1.4 }}>{mem.title}</p>
                    <span style={{ fontSize:11,color:'#475569',fontFamily:'monospace' }}>{mem.service}</span>

                    <div style={{ marginTop:12,display:'flex',flexDirection:'column',gap:7 }}>
                      <div><span style={{ fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'0.5px' }}>Root Cause</span>
                        <p style={{ fontSize:12,color:'#fde68a',margin:'3px 0 0',lineHeight:1.5 }}>{mem.rootCause}</p></div>
                      <div style={{ display:'flex',gap:5,alignItems:'flex-start' }}>
                        <CheckCircle2 size={11} color="#10b981" style={{ marginTop:2,flexShrink:0 }}/>
                        <span style={{ fontSize:12,color:'#6ee7b7',lineHeight:1.5 }}>{mem.resolution}</span>
                      </div>
                      {(mem.failedApproaches?.length ?? 0) > 0 && (
                        <div style={{ display:'flex',gap:5,alignItems:'flex-start' }}>
                          <XCircle size={11} color="#ef4444" style={{ marginTop:2,flexShrink:0 }}/>
                          <span style={{ fontSize:12,color:'#fca5a5',lineHeight:1.5 }}>{Array.isArray(mem.failedApproaches)?mem.failedApproaches.join(', '):mem.failedApproaches}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,paddingTop:10,borderTop:'1px solid #1e3a5f44' }}>
                      <span style={{ fontSize:10,color:'#334155' }}><Clock size={9} style={{ display:'inline',marginRight:3 }}/>{mem.resolutionTime}m MTTR</span>
                      <span style={{ fontSize:10,padding:'2px 8px',borderRadius:5,background:mem.outcome==='Success'?'rgba(16,185,129,0.12)':'rgba(245,158,11,0.12)',border:`1px solid ${mem.outcome==='Success'?'rgba(16,185,129,0.25)':'rgba(245,158,11,0.25)'}`,color:mem.outcome==='Success'?'#10b981':'#f59e0b',fontWeight:700 }}>{mem.outcome}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'patterns' && (
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <p style={{ fontSize:13,color:'#64748b',marginBottom:4 }}>Patterns automatically learned from recurring incident resolution data.</p>
            {PATTERNS.map(p=>(
              <div key={p.title} style={{
                background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:14,padding:'20px 22px',
                transition:'all 0.2s',borderLeft:'3px solid #8b5cf6',
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderLeftColor='#a78bfa';e.currentTarget.style.boxShadow='0 0 20px rgba(139,92,246,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderLeftColor='#8b5cf6';e.currentTarget.style.boxShadow='none';}}
              >
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <span style={{ fontSize:20 }}>{p.icon}</span>
                    <span style={{ fontSize:14,fontWeight:700,color:'#e2e8f0' }}>{p.title}</span>
                  </div>
                  <div style={{ display:'flex',gap:8,alignItems:'center',flexShrink:0 }}>
                    <span style={{ fontSize:11,color:'#a78bfa',fontWeight:700 }}>{p.confidence}% confidence</span>
                    <span style={{ fontSize:10,padding:'2px 8px',borderRadius:5,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',color:'#60a5fa' }}>{p.incidents} incidents</span>
                  </div>
                </div>
                <p style={{ fontSize:13,color:'#94a3b8',margin:0,lineHeight:1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
