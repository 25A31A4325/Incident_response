'use client';
import Sidebar from '@/components/layout/Sidebar';
import { Brain, Zap, AlertTriangle, Search, Cpu, CheckCircle2, Database, ArrowRight, ArrowDown } from 'lucide-react';

const steps = [
  { icon: AlertTriangle, color: '#ef4444', title: '1. Incident Detected', desc: 'Engineer reports a new incident — service name, severity, error message, and logs captured.' },
  { icon: Search,        color: '#f59e0b', title: '2. Hindsight Recall',  desc: 'IncidentMind queries Vectorize Hindsight with semantic search across all stored organizational memories.' },
  { icon: Database,      color: '#8b5cf6', title: '3. Memory Retrieved',  desc: 'Relevant historical incidents, root causes, successful fixes, and failed approaches are recalled.' },
  { icon: Cpu,           color: '#3b82f6', title: '4. AI Reasoning',      desc: 'Gemini AI analyzes the current incident using recalled memories to generate a context-aware recommendation.' },
  { icon: Zap,           color: '#60a5fa', title: '5. Recommendation',    desc: 'Engineer receives specific steps, warnings about failed approaches, and a confidence score.' },
  { icon: CheckCircle2,  color: '#10b981', title: '6. Resolution + Learn','desc': 'After resolving, the engineer saves the outcome — root cause, fix, and what failed — to Hindsight.' },
  { icon: Brain,         color: '#a78bfa', title: '7. Memory Grows',      desc: 'Next time a similar incident occurs, the agent recalls this resolution and becomes more accurate.' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, padding: '40px 32px', maxWidth: 900 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#f1f5f9' }}>How IncidentMind AI Works</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>The memory-powered incident response loop</p>
            </div>
          </div>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, maxWidth: 680, marginTop: 8 }}>
            IncidentMind AI doesn't just answer incidents — it <em>remembers</em> them. Powered by{' '}
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>Hindsight by Vectorize</span>, every resolution teaches
            the next response. Below is the exact loop that runs every time an incident is reported.
          </p>
        </div>

        {/* Flow steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={step.title} style={{ display: 'flex', gap: 20 }}>
                {/* Connector column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52, flexShrink: 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: `${step.color}15`, border: `2px solid ${step.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 16px ${step.color}25`,
                  }}>
                    <Icon size={20} color={step.color} />
                  </div>
                  {!isLast && (
                    <div style={{ width: 2, flex: 1, minHeight: 32, background: `linear-gradient(180deg, ${step.color}50, ${steps[i+1].color}50)`, margin: '4px 0' }} />
                  )}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1, background: '#0f1729', border: `1px solid ${step.color}25`,
                  borderRadius: 14, padding: '18px 22px', marginBottom: isLast ? 0 : 12,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = step.color + '60'; e.currentTarget.style.boxShadow = `0 0 20px ${step.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = step.color + '25'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: step.color, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout */}
        <div style={{ marginTop: 40, padding: '24px 28px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 16, textAlign: 'center' }}>
          <Brain size={28} color="#a78bfa" style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 15, color: '#c4b5fd', fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 6px' }}>
            "The agent doesn't just solve today's outage — it remembers yesterday's failures and learns what actually worked."
          </p>
          <span style={{ fontSize: 12, color: '#475569' }}>Powered by Hindsight by Vectorize · Gemini AI</span>
        </div>

        {/* Architecture diagram */}
        <div style={{ marginTop: 32, background: '#0f1729', border: '1px solid #1e3a5f', borderRadius: 16, padding: '24px 28px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>System Architecture</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Next.js Frontend', color: '#3b82f6' },
              { label: '→' },
              { label: 'Express API', color: '#10b981' },
              { label: '→' },
              { label: 'SQLite DB', color: '#f59e0b' },
              { label: '+' },
              { label: 'Hindsight (Vectorize)', color: '#8b5cf6' },
              { label: '+' },
              { label: 'Gemini AI', color: '#ef4444' },
            ].map((item, i) => (
              <span key={i}>
                {item.color
                  ? <span style={{ padding: '6px 14px', borderRadius: 8, background: `${item.color}15`, border: `1px solid ${item.color}30`, color: item.color, fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                  : <span style={{ color: '#334155', fontSize: 16, fontWeight: 700 }}>{item.label}</span>
                }
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
