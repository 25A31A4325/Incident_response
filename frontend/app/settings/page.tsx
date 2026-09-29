'use client';
import Sidebar from '@/components/layout/Sidebar';
import { Settings, Shield, Database, Key, Zap, Brain, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [show, setShow] = useState(false);

  const Field = ({ label, envVar, placeholder }: { label:string; envVar:string; placeholder:string }) => (
    <div>
      <label style={{ fontSize:11,color:'#64748b',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px',display:'block',marginBottom:5 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input type={show?'text':'password'} readOnly value="" placeholder={placeholder}
          style={{ width:'100%',background:'#0a0e17',border:'1px solid #1e3a5f',borderRadius:9,padding:'10px 36px 10px 13px',color:'#475569',fontSize:13,outline:'none',boxSizing:'border-box' as const }}/>
        <code style={{ position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',fontSize:10,color:'#334155' }}>{envVar}</code>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e17', color:'#e2e8f0', fontFamily:'system-ui,sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft:240, padding:'32px 28px', maxWidth:700 }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#f1f5f9', margin:0 }}>Settings</h1>
          <p style={{ fontSize:13, color:'#475569', margin:'4px 0 0' }}>Configure API connections · IncidentMind AI</p>
        </div>

        {/* Status card */}
        <div style={{ background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:14,padding:'16px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:10,height:10,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',animation:'pulse 2s infinite',flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:'#10b981' }}>Running in Demo Mode</div>
            <div style={{ fontSize:11,color:'#475569' }}>All features work without API keys. Add keys below to enable live Hindsight + Gemini AI.</div>
          </div>
        </div>

        {/* Hindsight section */}
        <div style={{ background:'#0f1729',border:'1px solid rgba(139,92,246,0.2)',borderRadius:16,padding:'22px 24px',marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:18 }}>
            <Brain size={16} color="#a78bfa"/>
            <span style={{ fontSize:15,fontWeight:800,color:'#e2e8f0' }}>Hindsight by Vectorize</span>
            <span style={{ marginLeft:'auto',fontSize:10,padding:'2px 8px',borderRadius:5,background:'rgba(100,116,139,0.1)',color:'#64748b',fontWeight:700,border:'1px solid #1e3a5f' }}>DEMO MODE</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <Field label="API Key" envVar="VECTORIZE_API_KEY" placeholder="Set in backend/.env"/>
            <Field label="Project ID" envVar="VECTORIZE_PROJECT_ID" placeholder="Set in backend/.env"/>
            <Field label="Pipeline ID" envVar="VECTORIZE_PIPELINE_ID" placeholder="Set in backend/.env"/>
          </div>
          <p style={{ fontSize:11,color:'#334155',marginTop:14 }}>
            Get keys from <span style={{ color:'#a78bfa' }}>vectorize.io</span> → Create project → Hindsight pipeline
          </p>
        </div>

        {/* Gemini section */}
        <div style={{ background:'#0f1729',border:'1px solid rgba(59,130,246,0.2)',borderRadius:16,padding:'22px 24px',marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:18 }}>
            <Zap size={16} color="#60a5fa"/>
            <span style={{ fontSize:15,fontWeight:800,color:'#e2e8f0' }}>Gemini AI (Google)</span>
            <span style={{ marginLeft:'auto',fontSize:10,padding:'2px 8px',borderRadius:5,background:'rgba(100,116,139,0.1)',color:'#64748b',fontWeight:700,border:'1px solid #1e3a5f' }}>DEMO MODE</span>
          </div>
          <Field label="Gemini API Key" envVar="GEMINI_API_KEY" placeholder="Set in backend/.env"/>
          <p style={{ fontSize:11,color:'#334155',marginTop:14 }}>
            Get from <span style={{ color:'#60a5fa' }}>aistudio.google.com</span> → Get API key
          </p>
        </div>

        {/* Env file location */}
        <div style={{ background:'#0f1729',border:'1px solid #1e3a5f',borderRadius:14,padding:'18px 20px' }}>
          <div style={{ fontSize:12,fontWeight:700,color:'#94a3b8',marginBottom:10 }}>📁 Where to set your keys</div>
          <code style={{ display:'block',background:'#0a0e17',border:'1px solid #1e3a5f',borderRadius:8,padding:'12px 14px',fontSize:12,color:'#60a5fa',lineHeight:1.8 }}>
            {`# backend/.env\nVECTORIZE_API_KEY=your-key\nVECTORIZE_PROJECT_ID=your-project\nVECTORIZE_PIPELINE_ID=your-pipeline\nGEMINI_API_KEY=your-gemini-key`}
          </code>
          <p style={{ fontSize:11,color:'#334155',marginTop:10 }}>After updating .env, restart the backend server to apply changes.</p>
        </div>

        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </main>
    </div>
  );
}
