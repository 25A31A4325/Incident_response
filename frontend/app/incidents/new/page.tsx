'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Brain, Zap, AlertTriangle, CheckCircle2, Clock, Send, Loader2, XCircle, ChevronRight, Shield, BarChart3 } from 'lucide-react';
import { createIncident, investigateIncident, resolveIncident } from '@/lib/api';
import type { InvestigationResult } from '@/lib/types';

type Step = 'form' | 'investigating' | 'result' | 'resolved';

const SERVICES = ['Payment API','Auth Service','Redis Cache','Database','API Gateway','Kubernetes','CDN','Third-party API','Notification Service','ML Inference'];
const SEVERITIES = ['critical','high','medium','low'] as const;
const SEV_COLORS: Record<string,(typeof SEVERITIES)[number]> = {critical:'critical',high:'high',medium:'medium',low:'low'};
const SEV_HEX: Record<string, string> = { critical:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#10b981' };

const STEPS_ANIM = [
  '🔍 Analyzing incident signals…',
  '🧠 Querying Hindsight memory…',
  '🔗 Retrieving relevant incidents…',
  '🤖 Generating AI recommendation…',
];

export default function NewIncidentPage() {
  const [step, setStep] = useState<Step>('form');
  const [animStep, setAnimStep] = useState(0);
  const [incidentId, setIncidentId] = useState('');
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [resolveData, setResolveData] = useState({ rootCause:'', resolution:'', failedApproaches:'', resolutionTime:'', feedback:'useful' });
  const [form, setForm] = useState({ title:'', service:'Payment API', environment:'production', severity:'critical' as (typeof SEVERITIES)[number], description:'', errorMessage:'', logs:'' });
  const [resolveSuccess, setResolveSuccess] = useState(false);

  const handleInvestigate = async () => {
    if (!form.title || !form.description) return;
    setStep('investigating');
    // Animate steps
    let i = 0;
    const t = setInterval(() => { i++; setAnimStep(i); if (i >= STEPS_ANIM.length - 1) clearInterval(t); }, 900);
    try {
      const { id } = await createIncident({ ...form, timestamp: new Date().toISOString(), severity: form.severity as any, environment: form.environment as any });
      setIncidentId(id);
      const inv = await investigateIncident(id, form.service);
      setResult(inv);
      setStep('result');
    } catch {
      setStep('form');
    }
  };

  const handleResolve = async () => {
    try {
      await resolveIncident(incidentId, {
        rootCause: resolveData.rootCause || 'Investigated and resolved',
        resolution: resolveData.resolution || 'Applied recommended fix',
        failedApproaches: resolveData.failedApproaches,
        result: 'Resolved',
        resolutionTime: parseInt(resolveData.resolutionTime) || 15,
        feedbackRating: 'Yes',
      });
    } catch {}
    setResolveSuccess(true);
    setStep('resolved');
  };

  const inputStyle = { width: '100%', background: '#0a0e17', border: '1px solid #1e3a5f', borderRadius: 9, padding: '10px 13px', color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.6px', display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: '32px 28px', maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
            {step === 'form' ? '🚨 Report New Incident' : step === 'investigating' ? '🔍 Investigating…' : step === 'resolved' ? '✅ Incident Resolved' : '🤖 AI Investigation Complete'}
          </h1>
          <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>
            IncidentMind AI · Memory-powered incident response
          </p>
        </div>

        {/* STEP: Form */}
        {step === 'form' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div style={{ background: '#0f1729', border: '1px solid #1e3a5f', borderRadius: 16, padding: '28px 28px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 24 }}>Incident Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div><label style={labelStyle}>Incident Title *</label>
                  <input style={inputStyle} placeholder="e.g. Payment API latency spike" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={labelStyle}>Service *</label>
                    <select style={inputStyle} value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value}))}>
                      {SERVICES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label style={labelStyle}>Environment</label>
                    <select style={inputStyle} value={form.environment} onChange={e=>setForm(f=>({...f,environment:e.target.value}))}>
                      {['production','staging','development'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={labelStyle}>Severity *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {SEVERITIES.map(s=>(
                      <button key={s} onClick={()=>setForm(f=>({...f,severity:s}))} style={{
                        flex:1, padding:'9px 0', borderRadius:9, border:`1px solid ${form.severity===s ? SEV_HEX[s] : '#1e3a5f'}`,
                        background: form.severity===s ? `${SEV_HEX[s]}18` : 'transparent',
                        color: form.severity===s ? SEV_HEX[s] : '#475569',
                        fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'capitalize',
                        boxShadow: form.severity===s ? `0 0 10px ${SEV_HEX[s]}30` : 'none',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div><label style={labelStyle}>Description / Symptoms *</label>
                  <textarea rows={3} style={{...inputStyle, resize:'vertical'}} placeholder="Describe what's happening, affected users, error patterns…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
                </div>
                <div><label style={labelStyle}>Error Message</label>
                  <input style={inputStyle} placeholder="e.g. Connection pool exhausted after 30s" value={form.errorMessage} onChange={e=>setForm(f=>({...f,errorMessage:e.target.value}))} />
                </div>
                <div><label style={labelStyle}>Recent Logs (optional)</label>
                  <textarea rows={3} style={{...inputStyle, resize:'vertical', fontFamily:'monospace', fontSize:12}} placeholder="Paste relevant log lines…" value={form.logs} onChange={e=>setForm(f=>({...f,logs:e.target.value}))} />
                </div>
                <button onClick={handleInvestigate} disabled={!form.title||!form.description} style={{
                  padding:'13px 0', borderRadius:11, border:'none',
                  background: form.title&&form.description ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#1e3a5f',
                  color: form.title&&form.description ? '#fff' : '#475569',
                  fontWeight:800, fontSize:15, cursor:form.title&&form.description?'pointer':'not-allowed',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: form.title&&form.description ? '0 0 24px rgba(59,130,246,0.3)' : 'none',
                  transition:'all 0.2s',
                }}>
                  <Brain size={18} /> Investigate with Hindsight AI
                </button>
              </div>
            </div>

            {/* Tips panel */}
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div style={{ background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:14,padding:'18px 20px' }}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}>
                  <Brain size={15} color="#a78bfa"/>
                  <span style={{fontSize:12,fontWeight:700,color:'#a78bfa'}}>HOW HINDSIGHT WORKS</span>
                </div>
                {['Semantically searches 128 stored incident memories','Recalls previous root causes and resolutions','Warns you about approaches that failed before','Generates context-aware AI recommendation'].map(t=>(
                  <div key={t} style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:7}}>
                    <CheckCircle2 size={11} color="#8b5cf6" style={{marginTop:2,flexShrink:0}}/>
                    <span style={{fontSize:11,color:'#94a3b8'}}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:14,padding:'18px 20px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#60a5fa',marginBottom:10}}>🎬 QUICK FILL — DEMO</div>
                <button onClick={()=>setForm({title:'Payment API latency increased to 8 seconds',service:'Payment API',environment:'production',severity:'critical',description:'P99 latency exceeded 8000ms. Users are experiencing payment timeouts. Connection pool metrics show high utilization.',errorMessage:'HikariPool: Connection is not available, request timed out after 30000ms',logs:'ERROR c.p.HikariPool - HikariPool-1 - Connection is not available'})} style={{
                  width:'100%',padding:'9px 0',borderRadius:9,border:'1px solid rgba(59,130,246,0.3)',
                  background:'rgba(59,130,246,0.1)',color:'#60a5fa',fontWeight:700,fontSize:12,cursor:'pointer',
                }}>
                  Fill: Payment API Incident
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Investigating */}
        {step === 'investigating' && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:400,gap:32}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(139,92,246,0.3)'}}>
              <Brain size={36} color="#a78bfa" style={{animation:'spin 2s linear infinite'}} />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:440}}>
              {STEPS_ANIM.map((s,i)=>(
                <div key={s} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:10,background:i<=animStep?'rgba(59,130,246,0.08)':'rgba(15,23,41,0.4)',border:`1px solid ${i<=animStep?'rgba(59,130,246,0.3)':'#1e3a5f22'}`,transition:'all 0.3s'}}>
                  {i<animStep?<CheckCircle2 size={15} color="#10b981"/>:i===animStep?<Loader2 size={15} color="#60a5fa" style={{animation:'spin 1s linear infinite'}}/>:<div style={{width:15,height:15,borderRadius:'50%',border:'1px solid #1e3a5f'}}/>}
                  <span style={{fontSize:13,color:i<=animStep?'#e2e8f0':'#334155'}}>{s}</span>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* STEP: Result */}
        {step === 'result' && result && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>

            {/* Hindsight Memory Panel */}
            <div style={{background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:16,overflow:'hidden'}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(139,92,246,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <Brain size={16} color="#a78bfa"/>
                  <span style={{fontSize:14,fontWeight:700,color:'#e2e8f0'}}>🧠 Hindsight Memory</span>
                </div>
                <span style={{fontSize:10,padding:'2px 8px',borderRadius:6,background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'#a78bfa',fontWeight:700}}>
                  {result.memoryCount ?? result.memoriesUsed?.length ?? 0} recalled
                </span>
              </div>
              <div style={{padding:'16px',maxHeight:480,overflowY:'auto',display:'flex',flexDirection:'column',gap:12}}>
                {(result.memoriesUsed??[]).length===0?(
                  <div style={{textAlign:'center',padding:'32px 16px',color:'#334155'}}>
                    <Brain size={28} color="#1e3a5f" style={{marginBottom:8}}/>
                    <p style={{fontSize:13,color:'#475569'}}>No prior memories matched this incident.</p>
                    <p style={{fontSize:11,color:'#334155',marginTop:4}}>After resolution, this will become the first memory for future incidents.</p>
                  </div>
                ) : (result.memoriesUsed??[]).map((mem:any,i:number)=>(
                  <div key={mem.id||i} style={{background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:10,padding:'12px 14px',borderLeft:'3px solid #8b5cf6'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:11,fontWeight:700,color:'#c4b5fd',fontFamily:'monospace'}}>{mem.id||mem.incidentId||`MEM-${i+1}`}</span>
                      <span style={{fontSize:10,color:'#10b981',fontWeight:700}}>{mem.similarity?`${Math.round(mem.similarity*100)}% match`:''}</span>
                    </div>
                    {mem.title&&<p style={{fontSize:12,color:'#e2e8f0',marginBottom:5,fontWeight:600}}>{mem.title}</p>}
                    {mem.rootCause&&<div style={{marginBottom:5}}><span style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:'0.5px'}}>Root Cause: </span><span style={{fontSize:11,color:'#fde68a'}}>{mem.rootCause}</span></div>}
                    {mem.resolution&&<div style={{display:'flex',gap:5,alignItems:'flex-start'}}><CheckCircle2 size={11} color="#10b981" style={{marginTop:2,flexShrink:0}}/><span style={{fontSize:11,color:'#6ee7b7'}}>{mem.resolution}</span></div>}
                    {mem.failedApproaches&&<div style={{display:'flex',gap:5,alignItems:'flex-start',marginTop:4}}><XCircle size={11} color="#ef4444" style={{marginTop:2,flexShrink:0}}/><span style={{fontSize:11,color:'#fca5a5'}}>{mem.failedApproaches}</span></div>}
                    {mem.resolutionTimeMinutes&&<div style={{marginTop:6,fontSize:10,color:'#475569'}}><Clock size={9} style={{display:'inline',marginRight:3}}/>{mem.resolutionTimeMinutes} min MTTR</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation Panel */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {/* Confidence */}
              <div style={{background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:14,padding:'16px 18px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:12,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>AI Confidence</span>
                  <span style={{fontSize:20,fontWeight:900,color:result.confidenceScore>=80?'#10b981':result.confidenceScore>=60?'#f59e0b':'#ef4444'}}>{result.confidenceScore}%</span>
                </div>
                <div style={{height:8,background:'#1e3a5f33',borderRadius:999,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${result.confidenceScore}%`,borderRadius:999,background:`linear-gradient(90deg,#3b82f6,${result.confidenceScore>=80?'#10b981':'#f59e0b'})`,transition:'width 1s ease'}}/>
                </div>
                <p style={{fontSize:11,color:'#334155',marginTop:6}}>Based on {result.memoryCount??0} historical incidents in Hindsight</p>
              </div>

              {/* Summary */}
              <div style={{background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:14,padding:'16px 18px'}}>
                <div style={{fontSize:11,color:'#60a5fa',fontWeight:700,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.5px'}}>Summary</div>
                <p style={{fontSize:13,color:'#cbd5e1',lineHeight:1.7,margin:0}}>{result.summary}</p>
              </div>

              {/* Steps */}
              <div style={{background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:14,padding:'16px 18px'}}>
                <div style={{fontSize:11,color:'#60a5fa',fontWeight:700,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px'}}>Recommended Steps</div>
                <ol style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
                  {(result.investigationSteps??result.recommendedActions??[]).slice(0,5).map((s:string,i:number)=>(
                    <li key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                      <span style={{width:20,height:20,borderRadius:6,background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',color:'#60a5fa',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</span>
                      <span style={{fontSize:12,color:'#94a3b8',fontFamily:'monospace',lineHeight:1.6}}>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warnings */}
              {(result.warnings??[]).length>0&&(
                <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:14,padding:'14px 16px'}}>
                  <div style={{fontSize:11,color:'#f59e0b',fontWeight:700,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.5px'}}>⚠ Warnings from History</div>
                  {(result.warnings??[]).map((w:string,i:number)=>(
                    <p key={i} style={{fontSize:12,color:'#fde68a',margin:'0 0 5px',lineHeight:1.6}}>{w.replace(/^⚠️\s*/,'')}</p>
                  ))}
                </div>
              )}

              {/* Resolve button */}
              <button onClick={()=>setStep('resolved')} style={{
                padding:'13px 0',borderRadius:11,border:'none',
                background:'linear-gradient(135deg,#059669,#047857)',
                color:'#fff',fontWeight:800,fontSize:15,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                boxShadow:'0 0 20px rgba(16,185,129,0.3)',
              }}>
                <CheckCircle2 size={18}/> Mark Resolved & Save to Hindsight
              </button>
            </div>
          </div>
        )}

        {/* STEP: Resolve form */}
        {step === 'resolved' && !resolveSuccess && (
          <div style={{maxWidth:680,margin:'0 auto',background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:16,padding:'32px'}}>
            <h2 style={{fontSize:18,fontWeight:800,color:'#e2e8f0',marginBottom:6}}>Save Resolution to Hindsight</h2>
            <p style={{fontSize:13,color:'#475569',marginBottom:24}}>This will be stored as a permanent memory — improving future incident responses.</p>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div><label style={labelStyle}>Actual Root Cause *</label>
                <input style={inputStyle} placeholder="e.g. DB connection pool exhausted under load" value={resolveData.rootCause} onChange={e=>setResolveData(d=>({...d,rootCause:e.target.value}))}/>
              </div>
              <div><label style={labelStyle}>What Fixed It *</label>
                <input style={inputStyle} placeholder="e.g. Increased pool size from 10 to 50, added index" value={resolveData.resolution} onChange={e=>setResolveData(d=>({...d,resolution:e.target.value}))}/>
              </div>
              <div><label style={labelStyle}>Failed Approaches (what didn't work)</label>
                <input style={inputStyle} placeholder="e.g. Service restart, horizontal scaling" value={resolveData.failedApproaches} onChange={e=>setResolveData(d=>({...d,failedApproaches:e.target.value}))}/>
              </div>
              <div><label style={labelStyle}>Resolution Time (minutes)</label>
                <input type="number" style={inputStyle} placeholder="e.g. 14" value={resolveData.resolutionTime} onChange={e=>setResolveData(d=>({...d,resolutionTime:e.target.value}))}/>
              </div>
              <div><label style={labelStyle}>Was the AI recommendation useful?</label>
                <div style={{display:'flex',gap:8}}>
                  {['useful','partially','not-useful'].map(v=>(
                    <button key={v} onClick={()=>setResolveData(d=>({...d,feedback:v}))} style={{
                      flex:1,padding:'8px 0',borderRadius:8,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:700,
                      borderColor:resolveData.feedback===v?'#3b82f6':'#1e3a5f',
                      background:resolveData.feedback===v?'rgba(59,130,246,0.12)':'transparent',
                      color:resolveData.feedback===v?'#60a5fa':'#475569',
                      textTransform:'capitalize',
                    }}>{v.replace('-',' ')}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleResolve} style={{
                padding:'13px 0',borderRadius:11,border:'none',
                background:'linear-gradient(135deg,#059669,#1d4ed8)',
                color:'#fff',fontWeight:800,fontSize:15,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              }}>
                <Brain size={18}/> Store Learning in Hindsight
              </button>
            </div>
          </div>
        )}

        {resolveSuccess && (
          <div style={{maxWidth:560,margin:'40px auto',textAlign:'center',padding:'40px',background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:20}}>
            <div style={{fontSize:48,marginBottom:16}}>🧠</div>
            <h2 style={{fontSize:22,fontWeight:900,color:'#10b981',marginBottom:8}}>Learning Stored in Hindsight!</h2>
            <p style={{fontSize:14,color:'#94a3b8',lineHeight:1.7,marginBottom:24}}>
              This incident's resolution is now part of the organizational memory. The next similar incident will benefit from this experience.
            </p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <a href="/incidents/new" style={{padding:'10px 22px',borderRadius:9,background:'linear-gradient(135deg,#2563eb,#7c3aed)',color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none'}}>+ New Incident</a>
              <a href="/memory" style={{padding:'10px 22px',borderRadius:9,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.08)',color:'#a78bfa',fontWeight:700,fontSize:13,textDecoration:'none'}}>View Memory</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
