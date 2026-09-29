'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Brain } from 'lucide-react';
import { getAnalytics, DEMO_ANALYTICS } from '@/lib/api';
import type { Analytics } from '@/lib/types';

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ background:'#1e3a5f22', borderRadius:6, height:10, overflow:'hidden', flex:1 }}>
      <div style={{ width:`${(value/max)*100}%`, height:'100%', background:color, borderRadius:6, transition:'width 1s ease', boxShadow:`0 0 6px ${color}60` }}/>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics>(DEMO_ANALYTICS);

  useEffect(()=>{
    getAnalytics().then(d=>setData(d||DEMO_ANALYTICS)).catch(()=>setData(DEMO_ANALYTICS));
  },[]);

  const maxRootCount = Math.max(...(data.rootCauseDistribution||[]).map(r=>r.value));
  const maxSvcTime   = Math.max(...(data.resolutionTimeByService||[]).map(r=>r.avgTime));
  const maxMonth     = Math.max(...(data.incidentsByMonth||[]).map(r=>r.count));
  const maxMemGrowth = Math.max(...(data.memoryGrowthOverTime||[]).map(r=>r.memories));

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e17', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft:240, padding:'32px 28px' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#f1f5f9', margin:0 }}>Analytics</h1>
          <p style={{ fontSize:13, color:'#475569', margin:'4px 0 0' }}>Operational intelligence · last 6 months</p>
        </div>

        {/* Top stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
          {[
            { label:'Total Incidents',  value:data.totalIncidents,    color:'#3b82f6', icon:BarChart3 },
            { label:'Resolved',         value:data.resolvedIncidents,  color:'#10b981', icon:CheckCircle2 },
            { label:'Avg MTTR',         value:`${data.avgResolutionTime}m`, color:'#f59e0b', icon:Clock },
            { label:'Memory Growth',    value:`+${data.knowledgeGrowth}%`,  color:'#a78bfa', icon:Brain },
          ].map(s=>{
            const Icon=s.icon;
            return(
              <div key={s.label} style={{ background:'#0f1729',border:`1px solid ${s.color}25`,borderRadius:14,padding:'18px 20px',boxShadow:`0 0 16px ${s.color}12`,transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 10px 24px ${s.color}25`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 0 16px ${s.color}12`;}}
              >
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
                  <span style={{ fontSize:10,color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px' }}>{s.label}</span>
                  <Icon size={14} color={s.color}/>
                </div>
                <div style={{ fontSize:30,fontWeight:900,color:s.color }}>{s.value}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          {/* Incidents by month */}
          <div style={{ background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:16,padding:'22px 24px' }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:20 }}>📅 Incidents by Month</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {(data.incidentsByMonth||[]).map(r=>(
                <div key={r.month} style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:11,color:'#64748b',width:32,flexShrink:0 }}>{r.month}</span>
                  <Bar value={r.count} max={maxMonth} color="#3b82f6"/>
                  <span style={{ fontSize:12,fontWeight:700,color:'#60a5fa',width:24,textAlign:'right',flexShrink:0 }}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Root cause */}
          <div style={{ background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:16,padding:'22px 24px' }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:20 }}>🔍 Root Cause Distribution</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {(data.rootCauseDistribution||[]).map(r=>(
                <div key={r.name} style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:11,color:'#64748b',width:130,flexShrink:0 }}>{r.name}</span>
                  <Bar value={r.value} max={maxRootCount} color={r.color}/>
                  <span style={{ fontSize:12,fontWeight:700,width:28,textAlign:'right',flexShrink:0,color:r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MTTR by service */}
          <div style={{ background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:16,padding:'22px 24px' }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:20 }}>⏱ Avg MTTR by Service (minutes)</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {(data.resolutionTimeByService||[]).map(r=>(
                <div key={r.service} style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:11,color:'#64748b',width:100,flexShrink:0 }}>{r.service}</span>
                  <Bar value={r.avgTime} max={maxSvcTime} color={r.avgTime>40?'#ef4444':r.avgTime>20?'#f59e0b':'#10b981'}/>
                  <span style={{ fontSize:12,fontWeight:700,color:'#e2e8f0',width:28,textAlign:'right',flexShrink:0 }}>{r.avgTime}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memory growth */}
          <div style={{ background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:16,padding:'22px 24px' }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',marginBottom:20 }}>🧠 Hindsight Memory Growth</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {(data.memoryGrowthOverTime||[]).map(r=>(
                <div key={r.month} style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:11,color:'#64748b',width:32,flexShrink:0 }}>{r.month}</span>
                  <Bar value={r.memories} max={maxMemGrowth} color="#8b5cf6"/>
                  <span style={{ fontSize:12,fontWeight:700,color:'#a78bfa',width:32,textAlign:'right',flexShrink:0 }}>{r.memories}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize:11,color:'#475569',marginTop:16,textAlign:'center',fontStyle:'italic' }}>"Every incident teaches the next one."</p>
          </div>
        </div>
      </main>
    </div>
  );
}
