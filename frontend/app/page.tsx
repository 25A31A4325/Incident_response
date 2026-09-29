"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Shield,
  Zap,
  Brain,
  Activity,
  Clock,
  TrendingUp,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  Circle,
  Eye,
  RefreshCw,
  Cpu,
  Database,
  Server,
  Globe,
  Terminal,
  Bell,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Play,
  Plus,
  BarChart3,
  Wifi,
  WifiOff,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "Active" | "Investigating" | "Resolved";

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: Status;
  time: string;
  source: string;
  service: string;
  rootCause?: string;
  memoriesFound?: number;
}

interface MetricCard {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ElementType;
  color: string;
  glow: string;
  border: string;
  sub?: string;
}

interface FeedEvent {
  id: string;
  text: string;
  time: string;
  type: "memory" | "resolve" | "alert" | "learn";
}

interface ServiceHealth {
  name: string;
  icon: React.ElementType;
  uptime: number;
  latency: number;
  status: "healthy" | "degraded" | "down";
}

/* ─── Static demo data ───────────────────────────────────────────── */
const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-103",
    title: "Payment API Latency Spike",
    severity: "Critical",
    status: "Active",
    time: "2 min ago",
    source: "Datadog",
    service: "payment-service",
    memoriesFound: 3,
  },
  {
    id: "INC-102",
    title: "Redis Cache Memory Exhaustion",
    severity: "High",
    status: "Investigating",
    time: "11 min ago",
    source: "Prometheus",
    service: "cache-service",
    memoriesFound: 2,
  },
  {
    id: "INC-101",
    title: "Auth JWT Secret Rotation Failure",
    severity: "Critical",
    status: "Investigating",
    time: "28 min ago",
    source: "PagerDuty",
    service: "auth-service",
    memoriesFound: 1,
  },
  {
    id: "INC-100",
    title: "Kafka Consumer Group Lag",
    severity: "Medium",
    status: "Investigating",
    time: "45 min ago",
    source: "Grafana",
    service: "notification-service",
    memoriesFound: 0,
  },
  {
    id: "INC-099",
    title: "API Gateway Upstream Timeout",
    severity: "High",
    status: "Resolved",
    time: "1 hr ago",
    source: "Cloudflare",
    service: "api-gateway",
    rootCause: "Inventory service memory leak",
    memoriesFound: 4,
  },
  {
    id: "INC-098",
    title: "Kubernetes Pod OOM Kill Loop",
    severity: "High",
    status: "Resolved",
    time: "3 hr ago",
    source: "K8s Events",
    service: "ml-inference-service",
    rootCause: "Memory limit underestimated",
    memoriesFound: 2,
  },
  {
    id: "INC-097",
    title: "Database Deadlock Storm",
    severity: "Medium",
    status: "Resolved",
    time: "6 hr ago",
    source: "MySQL Alerts",
    service: "inventory-service",
    rootCause: "Inconsistent lock ordering",
    memoriesFound: 1,
  },
];

const SERVICE_HEALTH: ServiceHealth[] = [
  { name: "Payment API",    icon: Cpu,      uptime: 99.1, latency: 312,  status: "degraded" },
  { name: "Auth Service",   icon: Shield,   uptime: 99.9, latency: 48,   status: "degraded" },
  { name: "Redis Cache",    icon: Database, uptime: 98.4, latency: 5,    status: "degraded" },
  { name: "API Gateway",    icon: Globe,    uptime: 99.9, latency: 21,   status: "healthy"  },
  { name: "Notification",   icon: Bell,     uptime: 97.2, latency: 890,  status: "degraded" },
  { name: "ML Inference",   icon: Layers,   uptime: 99.8, latency: 94,   status: "healthy"  },
];

const LIVE_FEED_INIT: FeedEvent[] = [
  { id: "f1", text: "🧠 Hindsight recalled 3 similar incidents for INC-103", time: "Just now",  type: "memory"  },
  { id: "f2", text: "✅ INC-097 resolution stored in Hindsight memory",      time: "6m ago",   type: "learn"   },
  { id: "f3", text: "🔴 New Critical: Payment API p99 latency at 8 200 ms",  time: "2m ago",   type: "alert"   },
  { id: "f4", text: "📈 Knowledge growth: +3 new patterns learned today",    time: "14m ago",  type: "learn"   },
  { id: "f5", text: "✅ INC-099 resolved — API Gateway restored",            time: "1hr ago",  type: "resolve" },
];

const TITLES_POOL = [
  "SQL Injection Pattern Detected",
  "Ransomware Payload Blocked",
  "Suspicious Internal Port Scan",
  "MFA Bypass Alert",
  "Exfiltration Attempt Detected",
  "DB Connection Pool Exhaustion",
  "SSL Certificate Expiry Warning",
  "CDN Cache Poisoning Detected",
];
const SOURCES_POOL  = ["Datadog", "Prometheus", "PagerDuty", "Grafana", "Cloudflare", "AWS CloudWatch", "SentinelOne", "CrowdStrike"];
const SERVICES_POOL = ["payment-service", "auth-service", "cache-service", "api-gateway", "notification-service", "ml-inference-service", "inventory-service", "cdn"];
const SEVERITIES: Severity[] = ["Critical", "Critical", "High", "High", "Medium"];

/* ─── Helpers ────────────────────────────────────────────────────── */
const SEV_CONFIG: Record<Severity, { bg: string; border: string; text: string; dot: string; glow: string }> = {
  Critical: { bg: "rgba(239,68,68,0.10)", border: "#ef4444", text: "#fca5a5", dot: "#ef4444", glow: "rgba(239,68,68,0.3)" },
  High:     { bg: "rgba(249,115,22,0.10)", border: "#f97316", text: "#fdba74", dot: "#f97316", glow: "rgba(249,115,22,0.25)" },
  Medium:   { bg: "rgba(245,158,11,0.10)", border: "#f59e0b", text: "#fde68a", dot: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
  Low:      { bg: "rgba(16,185,129,0.10)", border: "#10b981", text: "#6ee7b7", dot: "#10b981", glow: "rgba(16,185,129,0.2)" },
};

const STATUS_CONFIG: Record<Status, { text: string; color: string; icon: React.ElementType }> = {
  Active:       { text: "Active",       color: "#ef4444", icon: Circle       },
  Investigating:{ text: "Investigating",color: "#f59e0b", icon: Eye          },
  Resolved:     { text: "Resolved",     color: "#10b981", icon: CheckCircle2 },
};

const FEED_COLORS: Record<FeedEvent["type"], string> = {
  memory:  "#8b5cf6",
  resolve: "#10b981",
  alert:   "#ef4444",
  learn:   "#3b82f6",
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const c = SEV_CONFIG[severity];
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        boxShadow: severity === "Critical" ? `0 0 8px ${c.glow}` : "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: c.dot,
          display: "inline-block",
          boxShadow: `0 0 5px ${c.dot}`,
          animation: severity === "Critical" ? "pulse 1.5s infinite" : "none",
        }}
      />
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  const Icon = c.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        color: c.color,
      }}
    >
      <Icon size={13} style={{ flexShrink: 0 }} />
      {c.text}
    </span>
  );
}

function MiniSparkline({ color }: { color: string }) {
  const pts = Array.from({ length: 8 }, (_, i) => 20 + Math.random() * 25);
  const max = Math.max(...pts);
  const w = 64, h = 28;
  const step = w / (pts.length - 1);
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (p / max) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity: 0.7 }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={path + ` L${(pts.length - 1) * step},${h} L0,${h} Z`} fill={`url(#sg-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Mini bar chart for memory growth ──────────────────────────── */
function MemoryGrowthBar() {
  const data = [22, 38, 55, 71, 84, 96, 110, 128];
  const labels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 52 }}>
      {data.map((v, i) => (
        <div key={i} className="tooltip-wrap" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div
            style={{
              width: "100%",
              height: `${(v / max) * 48}px`,
              borderRadius: "3px 3px 0 0",
              background: i === data.length - 1
                ? "linear-gradient(180deg, #8b5cf6, #3b82f6)"
                : "linear-gradient(180deg, #3b82f620, #3b82f610)",
              border: `1px solid ${i === data.length - 1 ? "#8b5cf660" : "#3b82f620"}`,
              transition: "all 0.2s",
              cursor: "default",
            }}
          />
          <span style={{ fontSize: 9, color: "#475569" }}>{labels[i]}</span>
          <span className="tooltip-box">{v} memories</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Root cause donut ───────────────────────────────────────────── */
function RootCauseDonut() {
  const slices = [
    { label: "DB Connection", pct: 31, color: "#3b82f6" },
    { label: "Memory Issues", pct: 22, color: "#8b5cf6" },
    { label: "Config Errors", pct: 18, color: "#f59e0b" },
    { label: "Network",       pct: 15, color: "#10b981" },
    { label: "Third-party",   pct: 14, color: "#ef4444" },
  ];
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3a5f" strokeWidth={14} />
        {slices.map((s, i) => {
          const dash = (s.pct / 100) * circ;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={14}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#e2e8f0" fontSize={14} fontWeight={700}>128</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize={8}>total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {slices.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function IncidentDashboard() {
  const [incidents, setIncidents]       = useState<Incident[]>(INITIAL_INCIDENTS);
  const [search,    setSearch]          = useState("");
  const [filter,    setFilter]          = useState<"All" | Severity | Status>("All");
  const [feed,      setFeed]            = useState<FeedEvent[]>(LIVE_FEED_INIT);
  const [aiStatus,  setAiStatus]        = useState<"online" | "thinking" | "offline">("online");
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [now, setNow]                   = useState(new Date());
  const feedRef = useRef<HTMLDivElement>(null);

  /* Live clock */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Simulate AI thinking randomly */
  useEffect(() => {
    const t = setInterval(() => {
      setAiStatus("thinking");
      setTimeout(() => setAiStatus("online"), 1800);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  /* Derived counts */
  const criticalCount  = incidents.filter(i => i.severity === "Critical" && i.status !== "Resolved").length;
  const activeCount    = incidents.filter(i => i.status !== "Resolved").length;
  const resolvedCount  = incidents.filter(i => i.status === "Resolved").length;
  const memoriesTotal  = 128;

  /* Filter + search */
  const filtered = incidents.filter(i => {
    const matchSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.service.toLowerCase().includes(search.toLowerCase()) ||
      i.source.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      i.severity === filter ||
      i.status === filter;

    return matchSearch && matchFilter;
  });

  /* Trigger new incident */
  const triggerIncident = () => {
    const id = `INC-${104 + incidents.length - 7}`;
    const title = TITLES_POOL[Math.floor(Math.random() * TITLES_POOL.length)];
    const sev   = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const src   = SOURCES_POOL[Math.floor(Math.random() * SOURCES_POOL.length)];
    const svc   = SERVICES_POOL[Math.floor(Math.random() * SERVICES_POOL.length)];

    const newInc: Incident = { id, title, severity: sev, status: "Active", time: "Just now", source: src, service: svc, memoriesFound: Math.floor(Math.random() * 5) };
    setIncidents(prev => [newInc, ...prev]);

    const newFeed: FeedEvent = {
      id: Date.now().toString(),
      text: `🔴 New ${sev}: ${title} detected by ${src}`,
      time: "Just now",
      type: "alert",
    };
    setFeed(prev => [newFeed, ...prev.slice(0, 9)]);

    if (newInc.memoriesFound && newInc.memoriesFound > 0) {
      setTimeout(() => {
        setFeed(prev => [{
          id: Date.now().toString(),
          text: `🧠 Hindsight recalled ${newInc.memoriesFound} similar incident${newInc.memoriesFound! > 1 ? "s" : ""} for ${id}`,
          time: "Just now",
          type: "memory",
        }, ...prev.slice(0, 9)]);
      }, 1200);
    }
  };

  /* Update status */
  const updateStatus = (id: string, newStatus: Status) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id) return inc;
        const updated = { ...inc, status: newStatus };
        if (newStatus === "Resolved") {
          setFeed(f => [{
            id: Date.now().toString(),
            text: `✅ ${id} resolved — learning stored in Hindsight`,
            time: "Just now",
            type: "learn",
          }, ...f.slice(0, 9)]);
        }
        return updated;
      })
    );
  };

  /* Refresh */
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const selectedIncident = incidents.find(i => i.id === selectedId);

  const METRICS: MetricCard[] = [
    {
      label: "Critical Threats",
      value: criticalCount,
      delta: "+1 this hour",
      deltaUp: true,
      icon: AlertTriangle,
      color: "#ef4444",
      glow: "0 0 24px rgba(239,68,68,0.25)",
      border: "#ef444440",
      sub: "Requires immediate action",
    },
    {
      label: "Active Incidents",
      value: activeCount,
      delta: criticalCount > 0 ? "⚠ Action needed" : "Monitoring",
      deltaUp: criticalCount > 0,
      icon: Activity,
      color: "#f97316",
      glow: "0 0 24px rgba(249,115,22,0.2)",
      border: "#f9731640",
      sub: "Under investigation",
    },
    {
      label: "Resolved Today",
      value: resolvedCount,
      delta: "94% success rate",
      deltaUp: false,
      icon: CheckCircle2,
      color: "#10b981",
      glow: "0 0 24px rgba(16,185,129,0.2)",
      border: "#10b98140",
      sub: "Avg 18 min MTTR",
    },
    {
      label: "Hindsight Memories",
      value: memoriesTotal,
      delta: "+3 today",
      deltaUp: false,
      icon: Brain,
      color: "#8b5cf6",
      glow: "0 0 24px rgba(139,92,246,0.25)",
      border: "#8b5cf640",
      sub: "Knowledge growing",
    },
  ];

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e17",
        color: "#e2e8f0",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Ambient orbs ──────────────────────────────────────────── */}
      <div className="orb orb-blue"   style={{ width: 500, height: 500, top: -100, left: -100 }} />
      <div className="orb orb-purple" style={{ width: 400, height: 400, bottom: 50, right: 50 }} />
      <div className="orb orb-cyan"   style={{ width: 300, height: 300, top: "40%", left: "50%" }} />
      <div className="scan-line" />

      {/* ─── CSS keyframes (inline for zero-dep) ───────────────────── */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.9)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      <div style={{ position: "relative", zIndex: 2, padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ════════════════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════════════════ */}
        <header
          className="animate-fade-up glass"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderRadius: 16,
            border: "1px solid #1e3a5f",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Left: title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Logo mark */}
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(139,92,246,0.4)",
                flexShrink: 0,
              }}
            >
              <Brain size={22} color="#fff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 className="neon-blue" style={{ fontSize: 20, fontWeight: 800, color: "#60a5fa", margin: 0 }}>
                  IncidentMind AI
                </h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                  background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                  color: "#a78bfa", letterSpacing: "0.5px",
                }}>AI²</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "pulse 2s infinite", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#64748b" }}>AI Agent Active • Hindsight Memory Connected</span>
              </div>
            </div>
          </div>

          {/* Center: live clock + system status */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* AI status */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              background: "rgba(15,23,41,0.8)", borderRadius: 10, border: "1px solid #1e3a5f",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: aiStatus === "online" ? "#10b981" : aiStatus === "thinking" ? "#f59e0b" : "#ef4444",
                boxShadow: `0 0 8px ${aiStatus === "online" ? "#10b981" : aiStatus === "thinking" ? "#f59e0b" : "#ef4444"}`,
                animation: aiStatus === "thinking" ? "blink 0.6s infinite" : "pulse 3s infinite",
              }} />
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                {aiStatus === "online" ? "AI Agent Online" : aiStatus === "thinking" ? "AI Analyzing…" : "Agent Offline"}
              </span>
            </div>

            {/* Clock */}
            <div style={{
              padding: "8px 14px", background: "rgba(15,23,41,0.8)",
              borderRadius: 10, border: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 6,
            }}>
              <Clock size={13} color="#94a3b8" />
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "#60a5fa", fontWeight: 600, letterSpacing: "1px" }}>
                {now.toUTCString().slice(17, 25)} UTC
              </span>
            </div>

            {/* Hindsight badge */}
            <div style={{
              padding: "8px 14px", background: "rgba(139,92,246,0.08)",
              borderRadius: 10, border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", gap: 6,
            }}>
              <Zap size={13} color="#a78bfa" />
              <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>Hindsight Live</span>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={handleRefresh}
              style={{
                padding: "9px 14px", borderRadius: 10, border: "1px solid #1e3a5f",
                background: "rgba(15,23,41,0.8)", color: "#94a3b8", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#3b82f6")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e3a5f")}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              Refresh
            </button>

            <button
              onClick={triggerIncident}
              className="btn-primary"
              style={{
                padding: "9px 18px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700,
              }}
            >
              <Plus size={15} />
              Trigger Simulation
            </button>

            <button
              style={{
                padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.35)",
                background: "rgba(139,92,246,0.12)", color: "#a78bfa",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                fontSize: 13, fontWeight: 700, transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,92,246,0.12)")}
            >
              <Play size={13} />
              Demo Mode
            </button>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════════
            METRIC CARDS
        ════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16, marginBottom: 24 }}>
          {METRICS.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className={`metric-card animate-fade-up delay-${idx + 1}`}
                style={{
                  background: "#0f1729",
                  border: `1px solid ${m.border}`,
                  borderRadius: 16,
                  padding: "20px 22px",
                  boxShadow: m.glow,
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative corner */}
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 80, height: 80, borderRadius: "50%",
                  background: `radial-gradient(circle, ${m.color}18, transparent 70%)`,
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    {m.label}
                  </span>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: `${m.color}18`, border: `1px solid ${m.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} color={m.color} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 8 }}>
                  <span className="count-animate" style={{ fontSize: 38, fontWeight: 800, lineHeight: 1, color: "#f1f5f9" }}>
                    {m.value}
                  </span>
                  <MiniSparkline color={m.color} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: m.deltaUp ? "#fca5a5" : "#6ee7b7" }}>
                    {m.deltaUp ? <ArrowUpRight size={11} style={{ display: "inline" }} /> : ""}
                    {m.delta}
                  </span>
                  <span style={{ fontSize: 11, color: "#475569" }}>{m.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════
            MAIN GRID: left = incidents, right = side panels
        ════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Search + Filters ── */}
            <div
              className="animate-fade-up delay-3"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#0f1729", borderRadius: 12, padding: "10px 14px",
                border: "1px solid #1e3a5f", flexWrap: "wrap",
              }}
            >
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={14} color="#475569" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Search incidents, services, sources…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: "100%", background: "#131f35", border: "1px solid #1e3a5f",
                    borderRadius: 8, padding: "8px 12px 8px 32px",
                    color: "#e2e8f0", fontSize: 13, outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={e => (e.target.style.borderColor = "#1e3a5f")}
                />
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["All", "Critical", "High", "Medium", "Low", "Active", "Resolved"] as const).map(f => {
                  const sev = SEV_CONFIG[f as Severity];
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        background: isActive
                          ? (sev ? sev.bg : f === "Active" ? "rgba(239,68,68,0.12)" : f === "Resolved" ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.15)")
                          : "transparent",
                        border: isActive
                          ? `1px solid ${sev ? sev.border : f === "Active" ? "#ef4444" : f === "Resolved" ? "#10b981" : "#3b82f6"}`
                          : "1px solid #1e3a5f",
                        color: isActive
                          ? (sev ? sev.text : f === "Active" ? "#fca5a5" : f === "Resolved" ? "#6ee7b7" : "#60a5fa")
                          : "#64748b",
                        boxShadow: isActive && sev?.glow ? `0 0 10px ${sev.glow}` : "none",
                      }}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569", fontSize: 12 }}>
                <Filter size={13} />
                {filtered.length} incident{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* ── Incident Table ── */}
            <div
              className="animate-fade-up delay-4"
              style={{ background: "#0f1729", borderRadius: 16, border: "1px solid #1e3a5f", overflow: "hidden" }}
            >
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 120px 110px 130px 150px",
                padding: "12px 20px",
                borderBottom: "1px solid #1e293b",
                background: "#0a0e17",
              }}>
                {["ID", "Incident", "Service", "Severity", "Status", "Actions"].map(h => (
                  <span key={h} style={{ fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</span>
                ))}
              </div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "52px 20px", color: "#475569" }}>
                  <Terminal size={32} color="#1e3a5f" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 15, color: "#64748b" }}>No incidents match the current filter.</p>
                  <p style={{ fontSize: 12, color: "#334155", marginTop: 6 }}>Try a different filter or trigger a simulation.</p>
                </div>
              )}

              {/* Rows */}
              {filtered.map((inc, idx) => {
                const isSelected = selectedId === inc.id;
                const isNew = idx === 0 && inc.time === "Just now";
                return (
                  <React.Fragment key={inc.id}>
                    <div
                      className={`incident-row ${isNew ? "feed-item" : ""}`}
                      onClick={() => setSelectedId(isSelected ? null : inc.id)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "90px 1fr 120px 110px 130px 150px",
                        padding: "14px 20px",
                        alignItems: "center",
                        cursor: "pointer",
                        borderLeft: `3px solid ${isSelected ? SEV_CONFIG[inc.severity].border : "transparent"}`,
                        background: isSelected ? "rgba(59,130,246,0.04)" : "transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* ID */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>{inc.id}</span>
                        <span style={{ fontSize: 10, color: "#334155" }}>{inc.time}</span>
                      </div>

                      {/* Title */}
                      <div style={{ paddingRight: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{inc.title}</span>
                          {isNew && (
                            <span style={{
                              fontSize: 9, padding: "1px 5px", borderRadius: 4,
                              background: "rgba(239,68,68,0.15)", border: "1px solid #ef444440",
                              color: "#fca5a5", fontWeight: 700, animation: "pulse 1s infinite",
                            }}>NEW</span>
                          )}
                        </div>
                        {inc.memoriesFound !== undefined && inc.memoriesFound > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                            <Brain size={10} color="#a78bfa" />
                            <span style={{ fontSize: 10, color: "#a78bfa" }}>
                              {inc.memoriesFound} memor{inc.memoriesFound > 1 ? "ies" : "y"} recalled
                            </span>
                          </div>
                        )}
                        {inc.memoriesFound === 0 && (
                          <span style={{ fontSize: 10, color: "#334155" }}>No prior memories found</span>
                        )}
                      </div>

                      {/* Service */}
                      <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{inc.service}</span>

                      {/* Severity */}
                      <SeverityBadge severity={inc.severity} />

                      {/* Status */}
                      <StatusBadge status={inc.status} />

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6 }}>
                        {inc.status !== "Resolved" ? (
                          <>
                            {inc.status === "Active" && (
                              <button
                                onClick={e => { e.stopPropagation(); updateStatus(inc.id, "Investigating"); }}
                                style={{
                                  padding: "5px 10px", borderRadius: 7, border: "1px solid #334155",
                                  background: "#1e293b", color: "#94a3b8", fontSize: 11, fontWeight: 600,
                                  cursor: "pointer", transition: "all 0.15s",
                                  display: "flex", alignItems: "center", gap: 4,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#60a5fa"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
                              >
                                <Eye size={11} />Investigate
                              </button>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); updateStatus(inc.id, "Resolved"); }}
                              style={{
                                padding: "5px 10px", borderRadius: 7, border: "1px solid #10b98140",
                                background: "rgba(16,185,129,0.1)", color: "#34d399",
                                fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                              className="btn-success"
                            >
                              <CheckCircle2 size={11} />Resolve
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: "#334155" }}>Complete</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedId(isSelected ? null : inc.id); }}
                          style={{
                            width: 28, height: 28, borderRadius: 7, border: "1px solid #1e3a5f",
                            background: "transparent", color: "#475569", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#60a5fa"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#475569"; }}
                        >
                          <ChevronRight size={13} style={{ transform: isSelected ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                        </button>
                      </div>
                    </div>

                    {/* ── Expanded detail panel ── */}
                    {isSelected && selectedIncident && (
                      <div
                        className="animate-fade-scale"
                        style={{
                          padding: "16px 20px 20px",
                          borderTop: "1px solid #1e3a5f22",
                          background: "rgba(59,130,246,0.03)",
                          borderLeft: `3px solid ${SEV_CONFIG[selectedIncident.severity].border}`,
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                          {/* Hindsight Panel */}
                          <div style={{
                            background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)",
                            borderRadius: 10, padding: "12px 14px",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                              <Brain size={14} color="#a78bfa" />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>Hindsight Memory</span>
                            </div>
                            {(selectedIncident.memoriesFound ?? 0) > 0 ? (
                              <>
                                <p style={{ fontSize: 11, color: "#8b5cf6", marginBottom: 8 }}>
                                  {selectedIncident.memoriesFound} similar incident{(selectedIncident.memoriesFound ?? 0) > 1 ? "s" : ""} recalled
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {["INC-001: DB pool exhaustion → 11 min", "INC-011: Missing index → 9 min"].slice(0, selectedIncident.memoriesFound).map(m => (
                                    <div key={m} style={{ fontSize: 10, color: "#94a3b8", padding: "4px 8px", background: "rgba(139,92,246,0.08)", borderRadius: 6, borderLeft: "2px solid #8b5cf6" }}>{m}</div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p style={{ fontSize: 11, color: "#334155" }}>No historical context found. First occurrence.</p>
                            )}
                          </div>

                          {/* AI Recommendation */}
                          <div style={{
                            background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
                            borderRadius: 10, padding: "12px 14px",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                              <Zap size={14} color="#60a5fa" />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>AI Recommendation</span>
                            </div>
                            <ol style={{ paddingLeft: 14, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                              <li style={{ fontSize: 11, color: "#94a3b8" }}>Check DB connection pool utilization first</li>
                              <li style={{ fontSize: 11, color: "#94a3b8" }}>Compare with INC-001 metrics</li>
                              <li style={{ fontSize: 11, color: "#f87171" }}>⚠ Avoid restarting service (only temporary)</li>
                              <li style={{ fontSize: 11, color: "#94a3b8" }}>Apply pool increase if saturation confirmed</li>
                            </ol>
                          </div>

                          {/* Actions */}
                          <div style={{
                            background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)",
                            borderRadius: 10, padding: "12px 14px",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                              <Terminal size={14} color="#34d399" />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399" }}>Quick Actions</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {["Full AI Investigation", "View in History", "Save to Hindsight"].map(a => (
                                <button key={a} style={{
                                  padding: "6px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                                  color: "#34d399", cursor: "pointer", textAlign: "left",
                                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                                }}>{a} <ArrowUpRight size={10} /></button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Live Intelligence Feed ── */}
            <div
              className="animate-fade-left delay-2"
              style={{
                background: "#0f1729", borderRadius: 16,
                border: "1px solid #1e3a5f", overflow: "hidden",
              }}
            >
              <div style={{
                padding: "14px 16px", borderBottom: "1px solid #1e293b",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={14} color="#60a5fa" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Live Intelligence Feed</span>
                </div>
                <span style={{
                  fontSize: 9, padding: "2px 7px", borderRadius: 4,
                  background: "rgba(239,68,68,0.12)", border: "1px solid #ef444440",
                  color: "#fca5a5", fontWeight: 700, animation: "pulse 2s infinite", letterSpacing: "0.5px",
                }}>LIVE</span>
              </div>
              <div ref={feedRef} style={{ maxHeight: 240, overflowY: "auto", padding: "4px 0" }}>
                {feed.map((ev, i) => (
                  <div
                    key={ev.id}
                    className="feed-item"
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid #0a0e1744",
                      borderLeft: `3px solid ${FEED_COLORS[ev.type]}`,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{ev.text}</p>
                    <span style={{ fontSize: 10, color: "#334155" }}>{ev.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Service Health ── */}
            <div
              className="animate-fade-left delay-3"
              style={{ background: "#0f1729", borderRadius: 16, border: "1px solid #1e3a5f", overflow: "hidden" }}
            >
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <Server size={14} color="#60a5fa" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Service Health</span>
              </div>
              <div style={{ padding: "8px 0" }}>
                {SERVICE_HEALTH.map(svc => {
                  const Icon = svc.icon;
                  const statusColor = svc.status === "healthy" ? "#10b981" : svc.status === "degraded" ? "#f59e0b" : "#ef4444";
                  const uptimeColor = svc.uptime >= 99.5 ? "#10b981" : svc.uptime >= 98 ? "#f59e0b" : "#ef4444";
                  return (
                    <div
                      key={svc.name}
                      style={{
                        padding: "10px 16px", display: "flex", alignItems: "center", gap: 12,
                        borderBottom: "1px solid #0a0e1744", transition: "background 0.2s", cursor: "default",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: `${statusColor}12`, border: `1px solid ${statusColor}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={13} color={statusColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{svc.name}</span>
                          <span style={{ fontSize: 10, color: "#475569" }}>{svc.latency}ms</span>
                        </div>
                        <div style={{ background: "#1e3a5f33", borderRadius: 4, height: 4, overflow: "hidden" }}>
                          <div
                            className="progress-bar-inner"
                            style={{
                              height: "100%", width: `${svc.uptime}%`,
                              background: `linear-gradient(90deg, ${uptimeColor}aa, ${uptimeColor})`,
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      </div>
                      <div className="tooltip-wrap">
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: statusColor, display: "inline-block",
                          boxShadow: `0 0 6px ${statusColor}`,
                          animation: svc.status !== "healthy" ? "pulse 1.5s infinite" : "none",
                        }} />
                        <span className="tooltip-box">{svc.uptime}% uptime</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Memory + Root Cause ── */}
            <div
              className="animate-fade-left delay-4"
              style={{ background: "#0f1729", borderRadius: 16, border: "1px solid #1e3a5f", overflow: "hidden" }}
            >
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={14} color="#a78bfa" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Root Cause Distribution</span>
              </div>
              <div style={{ padding: "16px" }}>
                <RootCauseDonut />
              </div>
            </div>

            {/* ── Hindsight Memory Growth ── */}
            <div
              className="animate-fade-left delay-5"
              style={{
                background: "rgba(139,92,246,0.06)", borderRadius: 16,
                border: "1px solid rgba(139,92,246,0.25)", overflow: "hidden",
              }}
            >
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Brain size={14} color="#a78bfa" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Memory Growth</span>
                </div>
                <span style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 600 }}>+27% this month</span>
              </div>
              <div style={{ padding: "14px 16px 10px" }}>
                <MemoryGrowthBar />
                <p style={{ fontSize: 10, color: "#475569", marginTop: 8, textAlign: "center" }}>
                  "Every incident teaches the next one."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            BOTTOM: Quick Insight bar
        ════════════════════════════════════════════════════════════ */}
        <div
          className="animate-fade-up delay-6"
          style={{
            marginTop: 20,
            padding: "14px 20px",
            background: "rgba(15,23,41,0.8)",
            border: "1px solid #1e3a5f",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={14} color="#10b981" />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              <span style={{ color: "#6ee7b7", fontWeight: 700 }}>Avg MTTR:</span> 18 min
              &nbsp;→&nbsp; <span style={{ color: "#6ee7b7" }}>-34% vs last month</span>
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: "#1e3a5f" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Brain size={14} color="#a78bfa" />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              <span style={{ color: "#c4b5fd", fontWeight: 700 }}>Hindsight:</span> 128 memories • 5 learned patterns • 94 successful resolutions
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: "#1e3a5f" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Wifi size={14} color="#60a5fa" />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              <span style={{ color: "#93c5fd", fontWeight: 700 }}>Live Mode:</span> Real-time monitoring active
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["New Incident →", "Explore Memory →", "Run Demo →"].map(label => (
              <button
                key={label}
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: "transparent", border: "1px solid #1e3a5f", color: "#64748b",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#60a5fa"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#64748b"; }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}