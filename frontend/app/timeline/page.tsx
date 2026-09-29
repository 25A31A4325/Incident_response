"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Zap,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  Play,
  ChevronDown,
  ChevronUp,
  Database,
  Activity,
  Shield,
  Cpu,
  AlertTriangle,
  Lock,
  Unlock,
  BarChart3,
  Sparkles,
  Eye,
  GitBranch,
  MessageSquare,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface LearningStage {
  id: number;
  level: "Rookie" | "Aware" | "Experienced" | "Expert" | "Master";
  interactionRange: string;
  interactionLabel: string;
  date: string;
  memoriesUsed: number;
  confidence: number;
  color: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
  icon: React.ElementType;
  tagline: string;
  incidentTitle: string;
  agentResponse: string;
  reasoning: string;
  patternMatched: string | null;
  avoidedMistakes: string[];
  successRate: number;
  avgMTTR: number;
  skills: string[];
  memoryHighlights: { id: string; match: string; contribution: string }[];
  locked: boolean;
}

interface IncidentComparison {
  input: string;
  withoutHindsight: string;
  withHindsight: string;
  improvement: string;
}

/* ─── Data ───────────────────────────────────────────────────────── */
const STAGES: LearningStage[] = [
  {
    id: 1,
    level: "Rookie",
    interactionRange: "Interaction 1–3",
    interactionLabel: "First Contact",
    date: "3 months ago",
    memoriesUsed: 0,
    confidence: 22,
    color: "#64748b",
    glowColor: "rgba(100,116,139,0.3)",
    borderColor: "#64748b",
    bgColor: "rgba(100,116,139,0.06)",
    icon: BookOpen,
    tagline: "Generic, context-free recommendations",
    incidentTitle: "Payment API latency increased to 8 seconds",
    agentResponse:
      "Try restarting the payment service. Check your application logs. Consider scaling the service horizontally. Ensure database connectivity is stable.",
    reasoning:
      "No historical data available. Defaulting to general troubleshooting playbook.",
    patternMatched: null,
    avoidedMistakes: [],
    successRate: 44,
    avgMTTR: 42,
    skills: ["Basic triage", "Log analysis", "Generic playbook"],
    memoryHighlights: [],
    locked: false,
  },
  {
    id: 2,
    level: "Aware",
    interactionRange: "Interaction 4–8",
    interactionLabel: "Memory Online",
    date: "2 months ago",
    memoriesUsed: 2,
    confidence: 58,
    color: "#3b82f6",
    glowColor: "rgba(59,130,246,0.35)",
    borderColor: "#3b82f6",
    bgColor: "rgba(59,130,246,0.07)",
    icon: Database,
    tagline: "Recalling past incidents, avoiding obvious mistakes",
    incidentTitle: "Payment API latency elevated again (~4.5s)",
    agentResponse:
      "Check database connection pool utilization — a similar pattern appeared in a previous incident. Avoid restarting the service as first action; that only provided temporary relief before.",
    reasoning:
      "Recalled INC-001 from Hindsight. Database pool exhaustion pattern partially matches. Applying caution around service restart based on past outcome.",
    patternMatched: "INC-001 — DB pool exhaustion",
    avoidedMistakes: ["Blind service restart"],
    successRate: 67,
    avgMTTR: 28,
    skills: ["Memory recall", "Pattern linking", "Mistake avoidance"],
    memoryHighlights: [
      {
        id: "INC-001",
        match: "87% match",
        contribution: "Avoided service restart, prioritized DB pool check",
      },
    ],
    locked: false,
  },
  {
    id: 3,
    level: "Experienced",
    interactionRange: "Interaction 9–14",
    interactionLabel: "Pattern Mastery",
    date: "6 weeks ago",
    memoriesUsed: 5,
    confidence: 79,
    color: "#8b5cf6",
    glowColor: "rgba(139,92,246,0.4)",
    borderColor: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.08)",
    icon: Brain,
    tagline: "Cross-referencing multiple incidents, high precision",
    incidentTitle: "Payment API p99 at 12s — Black Friday traffic",
    agentResponse:
      "Current symptoms closely match INC-001 and INC-011. Check DB connection pool saturation AND compare connection acquisition latency before applying any mitigation. Expected root cause: combined pool exhaustion + missing index under load. Skip horizontal scaling (worsened pool contention in INC-001). Apply pool increase + query optimization simultaneously.",
    reasoning:
      "5 memories recalled. INC-001 (DB pool), INC-011 (missing index), INC-004 (pool + replicas) all converge on this pattern. Black Friday context matches INC-014 precursor conditions.",
    patternMatched: "INC-001 + INC-011 combined failure",
    avoidedMistakes: ["Horizontal scaling", "Blind pool increase without index fix"],
    successRate: 83,
    avgMTTR: 19,
    skills: [
      "Multi-incident synthesis",
      "Context-aware diagnosis",
      "Compound failure detection",
      "Proactive risk flagging",
    ],
    memoryHighlights: [
      { id: "INC-001", match: "94% match", contribution: "Pool exhaustion root cause" },
      { id: "INC-011", match: "88% match", contribution: "Missing index under load" },
      { id: "INC-004", match: "71% match", contribution: "Scaling anti-pattern warning" },
    ],
    locked: false,
  },
  {
    id: 4,
    level: "Expert",
    interactionRange: "Interaction 15–20",
    interactionLabel: "Prescient Agent",
    date: "3 weeks ago",
    memoriesUsed: 8,
    confidence: 92,
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.4)",
    borderColor: "#f59e0b",
    bgColor: "rgba(245,158,11,0.07)",
    icon: Star,
    tagline: "High-confidence, time-bounded, proactive predictions",
    incidentTitle: "Payment API connection timeout spike",
    agentResponse:
      "High confidence match with INC-001, INC-011, and INC-014. This is the third recurrence pattern. DB connection pool exhaustion is confirmed. Skip service restart — failed in INC-001 and INC-014. Apply connection pool increase immediately to 80 connections. Add missing composite index on payments(user_id, created_at DESC). Expected resolution: 9–15 minutes. Also initiate proactive capacity review — recurrence interval suggests architectural gap.",
    reasoning:
      "8 memories synthesized. Recurrence pattern detected across 3 prior incidents. Confidence elevated due to identical symptom fingerprint. Architectural risk advisory triggered.",
    patternMatched: "Third-recurrence systemic pattern — INC-001, INC-011, INC-014",
    avoidedMistakes: [
      "Service restart (3× failed)",
      "Horizontal scaling without pool fix",
      "Index-only fix without pool increase",
    ],
    successRate: 94,
    avgMTTR: 11,
    skills: [
      "Recurrence detection",
      "Time-bounded resolution estimate",
      "Architectural risk advisory",
      "Systemic pattern synthesis",
      "Proactive remediation",
    ],
    memoryHighlights: [
      { id: "INC-001", match: "97% match", contribution: "Core root cause pattern" },
      { id: "INC-011", match: "91% match", contribution: "Index optimization path" },
      { id: "INC-014", match: "89% match", contribution: "Compound failure context" },
      { id: "INC-004", match: "78% match", contribution: "Pool sizing guidance" },
    ],
    locked: false,
  },
  {
    id: 5,
    level: "Master",
    interactionRange: "Interaction 21+",
    interactionLabel: "Institutional Memory",
    date: "Current",
    memoriesUsed: 128,
    confidence: 97,
    color: "#10b981",
    glowColor: "rgba(16,185,129,0.4)",
    borderColor: "#10b981",
    bgColor: "rgba(16,185,129,0.07)",
    icon: Award,
    tagline: "Full organizational memory — predicts before it escalates",
    incidentTitle: "Any new service incident",
    agentResponse:
      "Instant cross-reference across 128 organizational memories. Pattern libraries built from 15 services. Pre-incident risk scoring based on historical precursor signals. Runbook auto-generation from successful resolution chains. Proactive architecture advisories before the next incident occurs.",
    reasoning:
      "128 organizational memories. 27 learned patterns. 94 successful resolution chains catalogued. Institutional knowledge preserved and continuously growing.",
    patternMatched: "Full organizational memory graph",
    avoidedMistakes: [
      "All 23 documented failed approaches",
      "6 known anti-patterns",
      "3 recurring systemic issues",
    ],
    successRate: 97,
    avgMTTR: 8,
    skills: [
      "Pre-incident prediction",
      "Full memory synthesis",
      "Auto-runbook generation",
      "Cross-service pattern detection",
      "Organizational knowledge preservation",
      "Proactive architecture review",
    ],
    memoryHighlights: [
      { id: "128 memories", match: "Full recall", contribution: "Complete organizational context" },
      { id: "27 patterns", match: "Active", contribution: "Real-time pattern matching" },
    ],
    locked: false,
  },
];

const COMPARISONS: IncidentComparison[] = [
  {
    input: "Payment API latency increased to 8 seconds",
    withoutHindsight: "Restart the payment service. Check logs. Scale horizontally if needed.",
    withHindsight:
      "Matched INC-001 (97%). Root cause: DB pool exhaustion. Skip restart — failed 3×. Increase pool to 80, add composite index. ETA: 9–15 min.",
    improvement: "73% faster resolution",
  },
  {
    input: "Auth service 100% error rate after secret rotation",
    withoutHindsight: "Roll back the secret rotation. Restart auth pods. Check JWT config.",
    withHindsight:
      "Matched INC-002 (92%). Do NOT roll back — security requirement. Implement 15-min dual-secret overlap (previously successful). ETA: 5 min.",
    improvement: "Avoided security violation",
  },
  {
    input: "Redis OOM errors, cache hit rate dropped to 0%",
    withoutHindsight: "Restart Redis. Reduce TTL values. Add more Redis nodes.",
    withHindsight:
      "Matched INC-003 (88%). Restarting causes cold cache storm (failed before). Change eviction policy to volatile-lru. Increase memory limit. ETA: 8 min.",
    improvement: "Avoided cache miss storm",
  },
];

const SKILL_TREE = [
  { level: 1, skills: ["Log Analysis", "Basic Triage"], color: "#64748b" },
  { level: 2, skills: ["Memory Recall", "Mistake Avoidance", "Pattern Linking"], color: "#3b82f6" },
  { level: 3, skills: ["Multi-Incident Synthesis", "Compound Failure Detection", "Context-Aware Diagnosis"], color: "#8b5cf6" },
  { level: 4, skills: ["Recurrence Detection", "Resolution Estimates", "Systemic Pattern Synthesis", "Architectural Advisory"], color: "#f59e0b" },
  { level: 5, skills: ["Pre-incident Prediction", "Auto-Runbook Generation", "Full Memory Graph", "Organizational Intelligence"], color: "#10b981" },
];

/* ─── Animated counter ───────────────────────────────────────────── */
function AnimatedNumber({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / 40;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(start));
          }, 30);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{value}{suffix}</span>;
}

/* ─── Progress ring ──────────────────────────────────────────────── */
function ProgressRing({ value, color, size = 64 }: { value: number; color: string; size?: number }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e3a5f" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-dasharray 1.2s ease" }}
      />
    </svg>
  );
}

/* ─── Stage Card ─────────────────────────────────────────────────── */
function StageCard({
  stage,
  isActive,
  onClick,
}: {
  stage: LearningStage;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = stage.icon;
  const isLast = stage.id === STAGES.length;

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Connector line (not last) */}
      {!isLast && (
        <div style={{
          position: "absolute",
          left: "50%",
          top: "100%",
          width: 2,
          height: 40,
          background: `linear-gradient(180deg, ${stage.color}60, ${STAGES[stage.id]?.color || "#1e3a5f"}60)`,
          zIndex: 0,
          transform: "translateX(-50%)",
        }} />
      )}

      {/* Card */}
      <div
        style={{
          background: isActive ? stage.bgColor : "rgba(15,23,41,0.6)",
          border: `1px solid ${isActive ? stage.borderColor : "#1e3a5f44"}`,
          borderRadius: 20,
          padding: "24px 28px",
          boxShadow: isActive ? `0 0 40px ${stage.glowColor}, 0 8px 32px rgba(0,0,0,0.3)` : "0 4px 16px rgba(0,0,0,0.15)",
          transform: isActive ? "scale(1.01)" : "scale(1)",
          transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient corner */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${stage.color}20, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Top bar */}
        <div style={{
          height: 3, borderRadius: 999,
          background: `linear-gradient(90deg, ${stage.color}, ${stage.color}44)`,
          position: "absolute", top: 0, left: 0, right: 0,
          boxShadow: isActive ? `0 0 8px ${stage.glowColor}` : "none",
        }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginTop: 4 }}>
          {/* Icon + level badge */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${stage.color}18`,
              border: `2px solid ${stage.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isActive ? `0 0 20px ${stage.glowColor}` : "none",
              transition: "all 0.35s",
            }}>
              <Icon size={24} color={stage.color} />
            </div>
            <div style={{
              marginTop: 6, textAlign: "center",
              fontSize: 9, fontWeight: 800, letterSpacing: "0.8px",
              color: stage.color, textTransform: "uppercase",
            }}>
              {stage.level}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 16, fontWeight: 800, color: isActive ? "#f1f5f9" : "#94a3b8",
                transition: "color 0.3s",
              }}>
                {stage.interactionRange}
              </span>
              <span style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 6,
                background: `${stage.color}18`, border: `1px solid ${stage.color}40`,
                color: stage.color, fontWeight: 700,
              }}>
                {stage.interactionLabel}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#475569" }}>
                {stage.date}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>
              {stage.tagline}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { label: "Memories Used", value: stage.memoriesUsed, icon: Brain, color: "#a78bfa" },
                { label: "Confidence", value: `${stage.confidence}%`, icon: Target, color: stage.color },
                { label: "Success Rate", value: `${stage.successRate}%`, icon: CheckCircle2, color: "#10b981" },
                { label: "Avg MTTR", value: `${stage.avgMTTR}m`, icon: Clock, color: "#f59e0b" },
              ].map(stat => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <StatIcon size={10} color={stat.color} />
                      <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {stat.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confidence ring */}
          <div style={{ flexShrink: 0, position: "relative" }}>
            <ProgressRing value={stage.confidence} color={stage.color} size={60} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column",
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: stage.color }}>{stage.confidence}</span>
              <span style={{ fontSize: 8, color: "#475569" }}>%</span>
            </div>
          </div>

          {/* Expand chevron */}
          <div style={{
            flexShrink: 0, width: 28, height: 28, borderRadius: 8,
            border: `1px solid ${isActive ? stage.borderColor : "#1e3a5f"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s",
            background: isActive ? `${stage.color}15` : "transparent",
          }}>
            {isActive
              ? <ChevronUp size={14} color={stage.color} />
              : <ChevronDown size={14} color="#475569" />
            }
          </div>
        </div>

        {/* ── Expanded content ── */}
        {isActive && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Divider */}
            <div style={{ height: 1, background: `linear-gradient(90deg, ${stage.color}40, transparent)` }} />

            {/* 3-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

              {/* Agent Response */}
              <div style={{
                background: "rgba(15,23,41,0.7)", border: "1px solid #1e3a5f",
                borderRadius: 12, padding: "14px 16px", gridColumn: "1 / 3",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <MessageSquare size={13} color={stage.color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: stage.color, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    AI Response for: "{stage.incidentTitle}"
                  </span>
                </div>
                <div style={{
                  background: `${stage.color}08`, border: `1px solid ${stage.color}25`,
                  borderRadius: 8, padding: "12px 14px",
                  borderLeft: `3px solid ${stage.color}`,
                }}>
                  <p style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                    "{stage.agentResponse}"
                  </p>
                </div>
                <p style={{ fontSize: 10, color: "#475569", marginTop: 8, fontStyle: "italic" }}>
                  🧠 Reasoning: {stage.reasoning}
                </p>
              </div>

              {/* Skills */}
              <div style={{
                background: "rgba(15,23,41,0.7)", border: "1px solid #1e3a5f",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <Layers size={13} color={stage.color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: stage.color, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    Skills Unlocked
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {stage.skills.map(skill => (
                    <div key={skill} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={11} color={stage.color} />
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Second row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Memory highlights */}
              {stage.memoryHighlights.length > 0 && (
                <div style={{
                  background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Brain size={13} color="#a78bfa" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                      Hindsight Memories Used ({stage.memoriesUsed})
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {stage.memoryHighlights.map(m => (
                      <div key={m.id} style={{
                        padding: "8px 10px", background: "rgba(139,92,246,0.08)",
                        borderRadius: 8, borderLeft: "2px solid #8b5cf6",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", fontFamily: "monospace" }}>{m.id}</span>
                          <span style={{ fontSize: 10, color: "#6ee7b7", fontWeight: 600 }}>{m.match}</span>
                        </div>
                        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>{m.contribution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avoided mistakes */}
              <div style={{
                background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <Shield size={13} color="#f87171" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                    Mistakes Avoided
                  </span>
                </div>
                {stage.avoidedMistakes.length === 0 ? (
                  <p style={{ fontSize: 11, color: "#334155", fontStyle: "italic" }}>
                    No historical data to draw from yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {stage.avoidedMistakes.map(m => (
                      <div key={m} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <span style={{ color: "#ef4444", fontSize: 12, flexShrink: 0 }}>✕</span>
                        <span style={{ fontSize: 11, color: "#f87171" }}>{m}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pattern matched */}
                {stage.patternMatched && (
                  <div style={{
                    marginTop: 10, padding: "6px 10px",
                    background: "rgba(245,158,11,0.08)", borderRadius: 8,
                    border: "1px solid rgba(245,158,11,0.2)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <GitBranch size={10} color="#f59e0b" />
                    <span style={{ fontSize: 10, color: "#fde68a" }}>Pattern: {stage.patternMatched}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Comparison Card ────────────────────────────────────────────── */
function ComparisonCard({ comparison, index }: { comparison: IncidentComparison; index: number }) {
  return (
    <div style={{
      background: "#0f1729", border: "1px solid #1e3a5f",
      borderRadius: 16, overflow: "hidden",
      transition: "all 0.25s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f640"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Input */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e3a5f", background: "rgba(30,58,95,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={12} color="#f59e0b" />
          <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Incident #{index + 1}</span>
        </div>
        <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4, fontStyle: "italic" }}>"{comparison.input}"</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {/* Without */}
        <div style={{ padding: "14px 16px", borderRight: "1px solid #1e3a5f" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748b" }} />
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Without Hindsight</span>
          </div>
          <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>"{comparison.withoutHindsight}"</p>
        </div>

        {/* With */}
        <div style={{ padding: "14px 16px", background: "rgba(59,130,246,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 6px #3b82f6" }} />
            <span style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase" }}>With Hindsight</span>
          </div>
          <p style={{ fontSize: 11, color: "#93c5fd", lineHeight: 1.6 }}>"{comparison.withHindsight}"</p>
        </div>
      </div>

      {/* Improvement badge */}
      <div style={{
        padding: "8px 16px", borderTop: "1px solid #1e3a5f",
        background: "rgba(16,185,129,0.05)",
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6,
      }}>
        <CheckCircle2 size={12} color="#10b981" />
        <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>{comparison.improvement}</span>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function LearningTimelinePage() {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [activeTab, setActiveTab] = useState<"timeline" | "comparison" | "skills">("timeline");

  useEffect(() => {
    const t = setTimeout(() => setProgressValue(80), 400);
    return () => clearTimeout(t);
  }, []);

  const globalStats = [
    { label: "Total Memories", value: 128, suffix: "", color: "#a78bfa", icon: Brain },
    { label: "Success Rate", value: 94, suffix: "%", color: "#10b981", icon: CheckCircle2 },
    { label: "Avg MTTR", value: 8, suffix: "m", color: "#f59e0b", icon: Clock },
    { label: "Patterns Learned", value: 27, suffix: "", color: "#3b82f6", icon: GitBranch },
  ];

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0a0e17", color: "#e2e8f0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", width: 500, height: 500, top: -150, left: -100, borderRadius: "50%", background: "#3b82f6", filter: "blur(100px)", opacity: 0.05, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 400, height: 400, bottom: 100, right: -50, borderRadius: "50%", background: "#8b5cf6", filter: "blur(100px)", opacity: 0.06, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 300, height: 300, top: "40%", left: "40%", borderRadius: "50%", background: "#f59e0b", filter: "blur(120px)", opacity: 0.04, pointerEvents: "none", zIndex: 0 }} />

      {/* Grid dots bg */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(rgba(30,58,95,0.2) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.92)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmerBar { from{background-position:-200% center} to{background-position:200% center} }
        .stage-enter { animation: slideUp 0.4s ease forwards; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO HEADER
        ══════════════════════════════════════════════════════════ */}
        <div className="stage-enter" style={{ textAlign: "center", marginBottom: 48 }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 999,
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
            marginBottom: 20,
          }}>
            <Brain size={14} color="#a78bfa" />
            <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, letterSpacing: "0.5px" }}>
              AGENT LEARNING TRAJECTORY
            </span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite", display: "inline-block" }} />
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 16,
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f59e0b 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Agent Learning Timeline
          </h1>

          <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 600, margin: "0 auto 24px", lineHeight: 1.7 }}>
            Every incident teaches the next one. Watch IncidentMind AI evolve from generic responses into an experienced institutional memory — powered by Hindsight.
          </p>

          {/* Overall progress bar */}
          <div style={{ maxWidth: 480, margin: "0 auto 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#475569" }}>Agent Maturity</span>
              <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>{progressValue}% Expert</span>
            </div>
            <div style={{ height: 8, background: "#1e3a5f33", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progressValue}%`, borderRadius: 999,
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #f59e0b)",
                boxShadow: "0 0 12px rgba(139,92,246,0.4)",
                transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                  animation: "shimmerBar 2s ease-in-out infinite",
                }} />
              </div>
            </div>
          </div>

          {/* Level labels */}
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 480, margin: "0 auto" }}>
            {STAGES.map(s => (
              <span key={s.id} style={{ fontSize: 9, color: s.color, fontWeight: 700, textTransform: "uppercase" }}>{s.level}</span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            GLOBAL STATS
        ══════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
          {globalStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="stage-enter"
                style={{
                  background: "#0f1729", border: `1px solid ${stat.color}30`,
                  borderRadius: 16, padding: "20px 22px", textAlign: "center",
                  boxShadow: `0 0 20px ${stat.color}15`,
                  animationDelay: `${i * 0.08}s`, opacity: 0,
                  transition: "all 0.25s ease", cursor: "default",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${stat.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 20px ${stat.color}15`; }}
              >
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 70, height: 70,
                  borderRadius: "50%", background: `radial-gradient(circle, ${stat.color}15, transparent 70%)`,
                }} />
                <div style={{
                  width: 36, height: 36, borderRadius: 10, margin: "0 auto 10px",
                  background: `${stat.color}15`, border: `1px solid ${stat.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} color={stat.color} />
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TABS
        ══════════════════════════════════════════════════════════ */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 32,
          background: "#0f1729", border: "1px solid #1e3a5f",
          borderRadius: 12, padding: 4, width: "fit-content",
        }}>
          {(["timeline", "comparison", "skills"] as const).map(tab => {
            const labels = { timeline: "📈 Learning Stages", comparison: "⚡ Before vs After", skills: "🎯 Skill Tree" };
            const isA = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "9px 20px", borderRadius: 9, border: "none",
                  background: isA ? "linear-gradient(135deg, #3b82f615, #8b5cf615)" : "transparent",
                  color: isA ? "#e2e8f0" : "#475569",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  outline: isA ? "1px solid #3b82f630" : "none",
                  transition: "all 0.2s",
                  boxShadow: isA ? "0 0 12px rgba(59,130,246,0.15)" : "none",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB: TIMELINE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "timeline" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {STAGES.map((stage, idx) => (
              <StageCard
                key={stage.id}
                stage={stage}
                isActive={activeStage === stage.id}
                onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
              />
            ))}

            {/* Evolution arrow summary */}
            <div style={{
              padding: "20px 24px", background: "#0f1729",
              border: "1px solid #1e3a5f", borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 12, flexWrap: "wrap",
            }}>
              {STAGES.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div style={{
                    padding: "6px 14px", borderRadius: 8,
                    background: `${s.color}12`, border: `1px solid ${s.color}30`,
                    color: s.color, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                    onClick={() => setActiveStage(activeStage === s.id ? null : s.id)}
                    onMouseEnter={e => { e.currentTarget.style.background = `${s.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${s.color}12`; }}
                  >
                    {s.level}
                  </div>
                  {i < STAGES.length - 1 && (
                    <ArrowRight size={16} color="#1e3a5f" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: BEFORE vs AFTER
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "comparison" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px", background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16,
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Sparkles size={20} color="#a78bfa" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
                  Without Memory vs With Hindsight
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
                  The same incident — dramatically different outcomes. See what persistent memory changes.
                </p>
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, maxWidth: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "#64748b" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Without Hindsight</span>
                <span style={{ fontSize: 11, color: "#334155" }}>— Generic AI</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "#3b82f6", boxShadow: "0 0 6px #3b82f6" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>With Hindsight</span>
                <span style={{ fontSize: 11, color: "#334155" }}>— Memory-Powered AI</span>
              </div>
            </div>

            {COMPARISONS.map((c, i) => (
              <ComparisonCard key={i} comparison={c} index={i} />
            ))}

            {/* Summary callout */}
            <div style={{
              padding: "20px 24px", background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16,
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
            }}>
              {[
                { label: "Faster Resolution", value: "73%", sub: "Average across all incidents" },
                { label: "Mistakes Avoided", value: "23", sub: "Documented failed approaches skipped" },
                { label: "Knowledge Retained", value: "100%", sub: "Every resolution stored permanently" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981" }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 700 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: SKILL TREE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "skills" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px", background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16,
              display: "flex", alignItems: "center", gap: 16, marginBottom: 8,
            }}>
              <Layers size={24} color="#60a5fa" />
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>
                  Agent Capability Progression
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
                  Each new level of Hindsight memory unlocks richer, more precise diagnostic capabilities.
                </p>
              </div>
            </div>

            {SKILL_TREE.map((tier, tierIdx) => {
              const stage = STAGES[tierIdx];
              const Icon = stage.icon;
              const isUnlocked = tier.level <= 4;
              return (
                <div
                  key={tier.level}
                  style={{
                    background: isUnlocked ? stage.bgColor : "rgba(15,23,41,0.4)",
                    border: `1px solid ${isUnlocked ? stage.color + "40" : "#1e3a5f22"}`,
                    borderRadius: 16, padding: "20px 24px",
                    boxShadow: isUnlocked ? `0 0 30px ${stage.glowColor}` : "none",
                    transition: "all 0.25s ease",
                    opacity: isUnlocked ? 1 : 0.6,
                    position: "relative", overflow: "hidden",
                  }}
                  onMouseEnter={e => { if (isUnlocked) { e.currentTarget.style.transform = "translateX(4px)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  {/* Level indicator */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                    background: `linear-gradient(180deg, ${stage.color}, ${stage.color}44)`,
                    borderRadius: "16px 0 0 16px",
                  }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* Icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: `${stage.color}18`, border: `2px solid ${stage.color}35`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={22} color={stage.color} />
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: stage.color }}>{stage.level}</span>
                        <span style={{ fontSize: 11, color: "#475569" }}>— {stage.interactionRange}</span>
                        {isUnlocked
                          ? <Unlock size={12} color={stage.color} />
                          : <Lock size={12} color="#475569" />
                        }
                      </div>

                      {/* Skills pills */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {tier.skills.map(skill => (
                          <span
                            key={skill}
                            style={{
                              padding: "4px 10px", borderRadius: 7,
                              background: isUnlocked ? `${stage.color}15` : "#1e3a5f15",
                              border: `1px solid ${isUnlocked ? stage.color + "30" : "#1e3a5f"}`,
                              color: isUnlocked ? stage.color : "#334155",
                              fontSize: 11, fontWeight: 600,
                              display: "flex", alignItems: "center", gap: 4,
                              transition: "all 0.2s",
                              cursor: "default",
                            }}
                            onMouseEnter={e => { if (isUnlocked) { e.currentTarget.style.background = `${stage.color}25`; e.currentTarget.style.transform = "scale(1.04)"; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = isUnlocked ? `${stage.color}15` : "#1e3a5f15"; e.currentTarget.style.transform = "scale(1)"; }}
                          >
                            {isUnlocked && <CheckCircle2 size={10} />}
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Memory count */}
                    <div style={{ textAlign: "center", flexShrink: 0, padding: "0 12px" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: stage.color }}>{stage.memoriesUsed}</div>
                      <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>memories</div>
                    </div>

                    {/* Confidence ring */}
                    <div style={{ flexShrink: 0, position: "relative" }}>
                      <ProgressRing value={stage.confidence} color={stage.color} size={54} />
                      <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center", flexDirection: "column",
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: stage.color }}>{stage.confidence}</span>
                        <span style={{ fontSize: 7, color: "#475569" }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  {tierIdx < SKILL_TREE.length - 1 && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 16, gap: 6, opacity: 0.4,
                    }}>
                      <ArrowRight size={12} color={stage.color} />
                      <span style={{ fontSize: 10, color: "#475569" }}>unlocks next level</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Hindsight quote */}
            <div style={{
              padding: "20px 24px", marginTop: 8,
              background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: 16, textAlign: "center",
            }}>
              <Brain size={28} color="#a78bfa" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, color: "#c4b5fd", fontStyle: "italic", lineHeight: 1.7, margin: "0 0 8px" }}>
                "Hindsight gives IncidentMind persistent memory. Instead of treating every incident as a new problem,
                the agent recalls previous incidents, learns from successful and unsuccessful resolutions,
                and uses that experience when handling future incidents."
              </p>
              <span style={{ fontSize: 12, color: "#475569" }}>— IncidentMind AI Core Principle</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
