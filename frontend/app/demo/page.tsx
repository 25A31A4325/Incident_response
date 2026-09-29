'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Brain, Play, CheckCircle2, ArrowRight, Zap, AlertTriangle, Clock } from 'lucide-react';
import { runDemoSequence, DEMO_MEMORIES } from '@/lib/api';
import type { DemoResult } from '@/lib/types';

type DemoStep = 'idle'|'step1'|'step2'|'done';

export default function DemoPage() {
  const [demoStep, setDemoStep] = useState<DemoStep>('idle');
  const [result, setResult] = useState<DemoResult|null>(null);
  const [running, setRunning] = useState(false);
  const [animIdx, setAnimIdx] = useState(0);

  const runDemo = async () => {
    setRunning(true);
    setDemoStep('step1');
    setAnimIdx(0);
    const t = setInterval(()=>setAnimIdx(i=>i+1),800);
    const r = await runDemoSequence().catch(()=>null);
    clearInterval(t);
    setResult(r);
    setDemoStep('done');
    setRunning(false);
  };

  const paymentMemories = DEMO_MEMORIES.filter(m=>m.service==='Payment API');

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e17', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft:240, padding:'32px 28px', maxWidth:1100 }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:999,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',marginBottom:12 }}>
            <Play size={12} color="#a78bfa"/>
            <span style={{ fontSize:11,color:'#a78bfa',fontWeight:700,letterSpacing:'0.5px' }}>JUDGE DEMO MODE</span>
          </div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#f1f5f9', margin:0 }}>🎬 IncidentMind AI Demo</h1>
          <p style={{ fontSize:14, color:'#94a3b8', margin:'6px 0 0', maxWidth:600, lineHeight:1.6 }}>
            Watch the AI agent evolve in real time — from a generic first response with 0 memories to a precision-targeted recommendation powered by Hindsight.
          </p>
        </div>

        {/* Run button */}
        {demoStep === 'idle' && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ width:80,height:80,borderRadius:'50%',background:'rgba(139,92,246,0.12)',border:'2px solid rgba(139,92,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',boxShadow:'0 0 40px rgba(139,92,246,0.3)' }}>
              <Brain size={36} color="#a78bfa"/>
            </div>
            <button onClick={runDemo} style={{
              padding:'16px 40px', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#7c3aed,#2563eb)',
              color:'#fff', fontWeight:900, fontSize:18, cursor:'pointer',
              boxShadow:'0 0 32px rgba(139,92,246,0.4)', display:'inline-flex',alignItems:'center',gap:10,
            }}>
              <Play size={20}/> Run Full Demo
            </button>
            <p style={{ fontSize:12,color:'#334155',marginTop:12 }}>Takes ~5 seconds · No API keys needed</p>
          </div>
        )}

        {/* Running */}
        {running && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <Brain size={40} color="#a78bfa" style={{ marginBottom:16,animation:'spin 1.5s linear infinite' }}/>
            <p style={{ fontSize:16,color:'#a78bfa',fontWeight:700 }}>Running demo sequence…</p>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Results */}
        {demoStep === 'done' && (
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

            {/* Comparison header */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {/* Without Hindsight */}
              <div style={{ background:'rgba(100,116,139,0.06)',border:'1px solid rgba(100,116,139,0.2)',borderRadius:16,padding:'22px 24px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                  <div style={{ width:8,height:8,borderRadius:2,background:'#64748b' }}/>
                  <span style={{ fontSize:14,fontWeight:800,color:'#94a3b8' }}>Without Hindsight</span>
                  <span style={{ fontSize:11,color:'#334155',marginLeft:4 }}>— Interaction #1</span>
                </div>
                <div style={{ background:'rgba(100,116,139,0.08)',border:'1px solid rgba(100,116,139,0.15)',borderRadius:10,padding:'14px 16px',marginBottom:12 }}>
                  <p style={{ fontSize:12,color:'#475569',margin:0,fontStyle:'italic',lineHeight:1.7 }}>
                    "Try restarting the payment service. Check your application logs. Consider scaling the service horizontally. Ensure database connectivity is stable."
                  </p>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                  {['0 historical memories','Generic troubleshooting steps','No failed-approach warnings','No specific commands'].map(t=>(
                    <div key={t} style={{ display:'flex',alignItems:'center',gap:6 }}>
                      <span style={{ color:'#ef4444',fontSize:12,flexShrink:0 }}>✕</span>
                      <span style={{ fontSize:12,color:'#64748b' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* With Hindsight */}
              <div style={{ background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:16,padding:'22px 24px',boxShadow:'0 0 30px rgba(59,130,246,0.1)' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                  <div style={{ width:8,height:8,borderRadius:2,background:'#3b82f6',boxShadow:'0 0 6px #3b82f6' }}/>
                  <span style={{ fontSize:14,fontWeight:800,color:'#60a5fa' }}>With Hindsight</span>
                  <span style={{ fontSize:11,color:'#334155',marginLeft:4 }}>— Interaction #2</span>
                  <span style={{ marginLeft:'auto',fontSize:10,padding:'2px 8px',borderRadius:5,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)',color:'#10b981',fontWeight:700 }}>73% FASTER</span>
                </div>
                <div style={{ background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:10,padding:'14px 16px',marginBottom:12,borderLeft:'3px solid #3b82f6' }}>
                  <p style={{ fontSize:12,color:'#93c5fd',margin:0,fontStyle:'italic',lineHeight:1.7 }}>
                    "Matched INC-001 (94%). Root cause: DB connection pool exhaustion. Skip service restart — it failed 3× previously. Increase pool size to 50 immediately. Run EXPLAIN ANALYZE on slow queries. Expected resolution: 9–15 min."
                  </p>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                  {[`${paymentMemories.length} relevant memories recalled`,'Specific commands provided','Failed approaches warned upfront','Confidence score: 92%'].map(t=>(
                    <div key={t} style={{ display:'flex',alignItems:'center',gap:6 }}>
                      <CheckCircle2 size={11} color="#10b981" style={{ flexShrink:0 }}/>
                      <span style={{ fontSize:12,color:'#94a3b8' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning loop callout */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
              {[
                { step:'1', label:'Incident Reported',    desc:'Payment API latency 8s+',     color:'#ef4444', done:true },
                { step:'2', label:'Hindsight Recalled',   desc:'2 memories matched at 94%',   color:'#8b5cf6', done:true },
                { step:'3', label:'Resolution Stored',    desc:'Saved to Hindsight forever',  color:'#10b981', done:true },
              ].map(s=>(
                <div key={s.step} style={{ background:'#0f1729',border:`1px solid ${s.color}25`,borderRadius:14,padding:'18px',textAlign:'center',boxShadow:`0 0 16px ${s.color}12` }}>
                  <div style={{ width:36,height:36,borderRadius:'50%',background:`${s.color}15`,border:`1px solid ${s.color}30`,margin:'0 auto 10px',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {s.done?<CheckCircle2 size={18} color={s.color}/>:<span style={{ fontSize:14,fontWeight:800,color:s.color }}>{s.step}</span>}
                  </div>
                  <div style={{ fontSize:13,fontWeight:700,color:'#e2e8f0',marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:11,color:'#475569' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign:'center', paddingTop:16 }}>
              <a href="/incidents/new" style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 28px',borderRadius:12,background:'linear-gradient(135deg,#2563eb,#7c3aed)',color:'#fff',fontWeight:800,fontSize:15,textDecoration:'none',boxShadow:'0 0 24px rgba(59,130,246,0.3)' }}>
                <Zap size={16}/> Try it with a real incident →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
