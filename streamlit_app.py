import os
import time
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dotenv import load_dotenv

# Try importing google.generativeai safely
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

load_dotenv()

# ─── Streamlit Page Configuration ───────────────────────────────────────────
st.set_page_config(
    page_title="IncidentMind — Intelligent Incident Response",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── Custom Cyberpunk / Dark SRE Styling ─────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    code, pre {
        font-family: 'JetBrains Mono', monospace !important;
    }

    .main {
        background-color: #0b0f19;
    }

    /* Metric cards */
    .metric-card {
        background: linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(31, 41, 55, 0.65));
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        padding: 18px 22px;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        border-color: rgba(59, 130, 246, 0.5);
    }
    .metric-value {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1.1;
    }
    .metric-title {
        color: #9CA3AF;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        margin-bottom: 6px;
    }
    .metric-sub {
        font-size: 0.78rem;
        margin-top: 6px;
    }

    /* Badge styles */
    .badge {
        display: inline-block;
        padding: 3px 9px;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .badge-critical {
        background-color: rgba(239, 68, 68, 0.2);
        color: #F87171;
        border: 1px solid rgba(239, 68, 68, 0.4);
    }
    .badge-high {
        background-color: rgba(245, 158, 11, 0.2);
        color: #FBBF24;
        border: 1px solid rgba(245, 158, 11, 0.4);
    }
    .badge-medium {
        background-color: rgba(59, 130, 246, 0.2);
        color: #60A5FA;
        border: 1px solid rgba(59, 130, 246, 0.4);
    }
    .badge-low {
        background-color: rgba(16, 185, 129, 0.2);
        color: #34D399;
        border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .badge-active {
        background-color: rgba(239, 68, 68, 0.15);
        color: #FCA5A5;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .badge-investigating {
        background-color: rgba(245, 158, 11, 0.15);
        color: #FCD34D;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-resolved {
        background-color: rgba(16, 185, 129, 0.15);
        color: #6EE7B7;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* Log box */
    .log-box {
        background-color: #030712;
        border: 1px solid #1F2937;
        border-radius: 8px;
        padding: 12px 16px;
        color: #34D399;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.82rem;
        line-height: 1.5;
        white-space: pre-wrap;
        max-height: 250px;
        overflow-y: auto;
    }

    /* RCA & Recommendation cards */
    .rca-card {
        background: rgba(17, 24, 39, 0.7);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 10px;
        padding: 18px;
        margin-bottom: 14px;
    }
    .warning-box {
        background: rgba(239, 68, 68, 0.1);
        border-left: 4px solid #EF4444;
        border-radius: 0 8px 8px 0;
        padding: 12px 16px;
        margin: 10px 0;
    }
    .success-box {
        background: rgba(16, 185, 129, 0.1);
        border-left: 4px solid #10B981;
        border-radius: 0 8px 8px 0;
        padding: 12px 16px;
        margin: 10px 0;
    }
</style>
""", unsafe_allow_html=True)

# ─── Demo Dataset Initialization ─────────────────────────────────────────────
DEFAULT_INCIDENTS = [
    {
        "id": "INC-001",
        "title": "Payment API Latency Spike (p99 > 8000ms)",
        "service": "payment-service",
        "environment": "production",
        "severity": "Critical",
        "status": "Active",
        "time": "3 min ago",
        "description": "Payment API response times spiked to 8000ms (p99). Users unable to complete checkout. Error rate increased to 23%. Downstream services timing out.",
        "errorMessage": "TimeoutError: Connection pool exhausted after 30000ms. No connections available. Pool size: 10, waiting: 47",
        "logs": "[14:32:01] WARN Pool utilization at 100%\n[14:32:15] ERROR Connection timeout - pool exhausted\n[14:32:15] ERROR 47 requests waiting for connection\n[14:32:30] CRITICAL Payment API p99 latency: 8234ms\n[14:32:45] ERROR Downstream checkout-service timeout",
        "rootCause": "Database connection pool exhaustion caused by surge in payment traffic combined with a unindexed query holding connections 10x longer than normal.",
        "resolution": "Increased connection pool size from 10 to 50, added connection timeout of 5000ms with automatic backoff retry, and indexed transaction lookup query.",
        "failedApproaches": "1. Restarted payment service pods (DB pool exhausted immediately again).\n2. Scaled horizontally (multiplied pool contention on Postgres).\n3. Disabled query cache (no effect).",
        "resolutionTimeMinutes": 11,
        "memoriesFound": 3
    },
    {
        "id": "INC-002",
        "title": "Auth Service Complete Outage (Token Signature Mismatch)",
        "service": "auth-service",
        "environment": "production",
        "severity": "Critical",
        "status": "Investigating",
        "time": "14 min ago",
        "description": "Auth service stopped accepting requests after emergency JWT secret rotation. All users logged out simultaneously. Login attempts returning 401.",
        "errorMessage": "JsonWebTokenError: invalid signature. All existing tokens invalidated after secret rotation without session migration.",
        "logs": "[09:15:00] INFO JWT secret rotation initiated\n[09:15:02] ERROR JsonWebTokenError: invalid signature\n[09:15:02] ERROR 100% auth failure rate\n[09:15:10] CRITICAL Auth service: 0% success rate\n[09:15:15] ERROR All active sessions invalidated",
        "rootCause": "JWT secret rotation was performed without a grace period for existing tokens. New secret was applied immediately, invalidating all active user sessions.",
        "resolution": "Implemented dual-secret validation: accept both old and new secrets for 15-minute overlap window. Rotated to new secret with graceful user session renewal.",
        "failedApproaches": "1. Rolling back secret rotation (blocked by security policy).\n2. Blanket token refresh (failed because validation logic was rejecting).\n3. Restarting auth service pods (no effect).",
        "resolutionTimeMinutes": 23,
        "memoriesFound": 2
    },
    {
        "id": "INC-003",
        "title": "Redis Cache Layer Failure & Key Eviction Storm",
        "service": "cache-service",
        "environment": "production",
        "severity": "High",
        "status": "Resolved",
        "time": "45 min ago",
        "description": "Redis cache hit rate dropped from 94% to 0% causing severe database load. API response times increased 10x. Database CPU at 98%. Cache service reporting OOM.",
        "errorMessage": "OOMKilled: Redis container exceeded memory limit of 2Gi. maxmemory-policy: allkeys-lru. All keys evicted.",
        "logs": "[11:45:00] WARN Redis memory usage: 95%\n[11:45:30] ERROR Redis OOM: evicting keys\n[11:45:31] CRITICAL Cache hit rate: 0%\n[11:45:31] CRITICAL DB CPU: 98%\n[11:46:00] ERROR Redis connection refused - restarting",
        "rootCause": "Redis memory limit was set too low for recent traffic spike. The allkeys-lru eviction policy then purged all keys including permanent session data.",
        "resolution": "Increased Redis memory limit from 2GB to 8GB. Changed eviction policy to volatile-lru (only evict keys with TTL). Configured alert threshold at 80%.",
        "failedApproaches": "1. Restarting Redis (lost remaining warm keys, worsened cache stampede).\n2. Lowering TTL values (storm worsened).\n3. Disabling cache on checkout (overwhelmed Postgres).",
        "resolutionTimeMinutes": 8,
        "memoriesFound": 4
    },
    {
        "id": "INC-004",
        "title": "Database Connection Pool Exhaustion (Replica Oversubscription)",
        "service": "user-service",
        "environment": "production",
        "severity": "High",
        "status": "Resolved",
        "time": "2 hours ago",
        "description": "User service database connections exhausted during peak traffic. New user registrations failing. Profile update requests timing out.",
        "errorMessage": "PoolError: Cannot acquire connection. Pool is at capacity (20/20). Queued: 312. Wait timeout: 30000ms exceeded.",
        "logs": "[16:20:00] WARN DB pool: 18/20 connections active\n[16:20:30] ERROR DB pool: 20/20 at capacity\n[16:20:31] ERROR 312 requests queued for DB connection\n[16:21:00] ERROR Pool wait timeout exceeded",
        "rootCause": "Database connection pool size was not adjusted when user service was scaled to 10 replicas. 10 replicas * 20 connections exceeded DB max_connections limit of 100.",
        "resolution": "Configured PgBouncer connection pooler in front of PostgreSQL. Reduced pool size per replica to 8 (total 80 connections, leaving 20 for admin/cron).",
        "failedApproaches": "1. Simply raising replica pool sizes (crashed Postgres server).\n2. Restarting service replicas (only relieved pressure for 30 seconds).",
        "resolutionTimeMinutes": 14,
        "memoriesFound": 2
    },
    {
        "id": "INC-005",
        "title": "Failed Deployment: Missing Secret in Production Namespace",
        "service": "order-service",
        "environment": "production",
        "severity": "High",
        "status": "Resolved",
        "time": "4 hours ago",
        "description": "Order service deployment failed due to missing environment variable. New pods in CrashLoopBackOff. Order creation returning 503.",
        "errorMessage": "Error: Required environment variable DATABASE_URL is not set. Cannot start application. Exiting with code 1.",
        "logs": "[10:00:00] INFO Deployment order-service:v2.3.1 started\n[10:00:30] INFO Pod order-service-new-1: Running\n[10:00:35] ERROR DATABASE_URL not found in environment\n[10:00:36] ERROR Pod order-service-new-1: CrashLoopBackOff",
        "rootCause": "New deployment config referenced a Kubernetes secret that was not created in the production namespace (only present in staging).",
        "resolution": "Performed instant rollback with `kubectl rollout undo deployment/order-service`. Created missing secret in production namespace. Re-deployed successfully.",
        "failedApproaches": "1. Manually patching env vars on crashing pods directly.\n2. Attempting to fast-forward code hotfix while traffic was failing.",
        "resolutionTimeMinutes": 6,
        "memoriesFound": 3
    }
]

# Initialize Session State
if "incidents" not in st.session_state:
    st.session_state.incidents = DEFAULT_INCIDENTS
if "selected_incident_id" not in st.session_state:
    st.session_state.selected_incident_id = "INC-001"
if "ai_investigations" not in st.session_state:
    st.session_state.ai_investigations = {}
if "demo_mode" not in st.session_state:
    st.session_state.demo_mode = True

# ─── Helper: Gemini AI Client ───────────────────────────────────────────────
def get_gemini_api_key() -> Optional[str]:
    # Check streamlit secrets first
    if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
        return st.secrets["GEMINI_API_KEY"]
    # Check session state
    if "user_gemini_key" in st.session_state and st.session_state.user_gemini_key:
        return st.session_state.user_gemini_key
    # Check env
    return os.getenv("GEMINI_API_KEY")

def run_gemini_investigation(incident: Dict[str, Any], memories: List[Dict[str, Any]]) -> Dict[str, Any]:
    api_key = get_gemini_api_key()
    
    if api_key and GENAI_AVAILABLE and not st.session_state.demo_mode:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""
You are IncidentMind AI, an elite Site Reliability Engineering (SRE) Incident Commander.
Analyze the following production incident and historical organizational memories:

INCIDENT DETAILS:
Title: {incident['title']}
Service: {incident['service']}
Severity: {incident['severity']}
Description: {incident['description']}
Error: {incident.get('errorMessage', 'N/A')}
Logs:
{incident.get('logs', 'N/A')}

HISTORICAL ORGANIZATIONAL MEMORIES:
{json.dumps([{
    'title': m['title'],
    'rootCause': m['rootCause'],
    'resolution': m['resolution'],
    'failedApproaches': m['failedApproaches']
} for m in memories[:3]], indent=2)}

Provide your response in JSON format with exactly the following keys:
{{
    "rootCauseSummary": "Clear 2-sentence explanation of the exact root cause",
    "confidenceScore": 94,
    "recommendedActions": [
        "Action step 1",
        "Action step 2",
        "Action step 3"
    ],
    "commandsToRun": "Exact bash/CLI commands or SQL to remediate",
    "failedApproachesWarning": "What dangerous actions the team must avoid (based on historical memory)",
    "preventionSafeguard": "Permanent architectural fix to prevent recurrence"
}}
Return ONLY valid JSON.
"""
            response = model.generate_content(prompt)
            text = response.text.strip()
            # Remove markdown json code block if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            data = json.loads(text.strip())
            data["source"] = "Gemini 1.5 Flash (Live)"
            return data
        except Exception as e:
            st.warning(f"Gemini API call failed ({e}). Falling back to Hindsight intelligent engine.")
    
    # Built-in intelligent fallback engine
    time.sleep(0.8) # Simulate AI thinking
    return {
        "rootCauseSummary": incident["rootCause"],
        "confidenceScore": 96,
        "recommendedActions": [
            f"Apply immediate mitigation: {incident['resolution'].split(',')[0]}",
            "Verify downstream service latency metrics on telemetry dashboard",
            "Monitor connection pool and error rates for 5 minutes post-fix",
            "Create post-incident review item for automated safeguard"
        ],
        "commandsToRun": f"# Immediate Remediation\nkubectl scale deployment/{incident['service']} --replicas=5\n# Update connection timeout\nexport DB_POOL_TIMEOUT_MS=5000\nexport DB_MAX_POOL_SIZE=50",
        "failedApproachesWarning": f"CRITICAL: Do NOT attempt the following failed steps:\n{incident['failedApproaches']}",
        "preventionSafeguard": "Implement healthcheck probe alerts, automate PgBouncer scaling, and add pool saturation telemetry to alerting rules.",
        "source": "IncidentMind Knowledge Engine (Hindsight)"
    }

# ─── Sidebar Navigation ─────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 🛡️ **IncidentMind AI**")
    st.caption("Intelligent Incident Response & Postmortem Memory")
    
    api_key_status = "🟢 Configured" if get_gemini_api_key() else "🟡 Demo Mode"
    st.markdown(f"**AI Engine Status:** `{api_key_status}`")
    
    st.markdown("---")
    view_selection = st.radio(
        "Navigation",
        [
            "📊 Operations Dashboard",
            "🚨 Live Incident Investigation (RCA)",
            "🧠 Hindsight Organizational Memory",
            "⚡ Chaos Simulator & Reporter",
            "📈 Postmortem Analytics & MTTR",
            "⚙️ Settings & Configuration"
        ]
    )
    
    st.markdown("---")
    st.markdown("#### ⚡ Active Status")
    active_count = sum(1 for inc in st.session_state.incidents if inc["status"] in ["Active", "Investigating"])
    st.metric("Incidents In Flight", f"{active_count}", delta=f"{active_count} unresolved", delta_color="inverse")
    
    st.markdown("---")
    st.caption("IncidentMind v1.0 • Ready for Streamlit Cloud")

# ─── View 1: Operations Dashboard ───────────────────────────────────────────
if view_selection == "📊 Operations Dashboard":
    st.title("SRE Incident Operations Dashboard")
    st.caption("Real-time telemetry, active production alerts, and organizational MTTR performance.")
    
    # Metric cards row
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Active Outages</div>
            <div class="metric-value" style="color: #EF4444;">1</div>
            <div class="metric-sub" style="color: #F87171;">Critical severity: Payment API</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Investigating</div>
            <div class="metric-value" style="color: #F59E0B;">1</div>
            <div class="metric-sub" style="color: #FBBF24;">Auth Service (JWT rotation)</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Mean Time to Resolve (MTTR)</div>
            <div class="metric-value" style="color: #10B981;">12.4m</div>
            <div class="metric-sub" style="color: #34D399;">⚡ -72% reduction via Hindsight</div>
        </div>
        """, unsafe_allow_html=True)
    with c4:
        st.markdown("""
        <div class="metric-card">
            <div class="metric-title">Memories Indexed</div>
            <div class="metric-value" style="color: #3B82F6;">142</div>
            <div class="metric-sub" style="color: #60A5FA;">Vectorized resolutions & failures</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Service Health and Telemetry
    col_left, col_right = st.columns([1.5, 1])
    
    with col_left:
        st.subheader("Production Incidents Stream")
        
        # Filter controls
        f_col1, f_col2 = st.columns([2, 2])
        with f_col1:
            severity_filter = st.multiselect("Filter Severity", ["Critical", "High", "Medium", "Low"], default=["Critical", "High"])
        with f_col2:
            status_filter = st.multiselect("Filter Status", ["Active", "Investigating", "Resolved"], default=["Active", "Investigating", "Resolved"])
            
        filtered_incidents = [
            i for i in st.session_state.incidents 
            if (not severity_filter or i["severity"] in severity_filter) and (not status_filter or i["status"] in status_filter)
        ]
        
        for inc in filtered_incidents:
            with st.container():
                sev_class = f"badge-{inc['severity'].lower()}"
                stat_class = f"badge-{inc['status'].lower()}"
                
                header_cols = st.columns([3, 1, 1])
                with header_cols[0]:
                    st.markdown(f"**{inc['id']}** — {inc['title']}")
                    st.caption(f"Service: `{inc['service']}` • Occurred: {inc['time']}")
                with header_cols[1]:
                    st.markdown(f"<span class='badge {sev_class}'>{inc['severity']}</span>", unsafe_allow_html=True)
                    st.markdown(f"<span class='badge {stat_class}'>{inc['status']}</span>", unsafe_allow_html=True)
                with header_cols[2]:
                    if st.button("Investigate →", key=f"inv_{inc['id']}"):
                        st.session_state.selected_incident_id = inc["id"]
                        st.session_state.view_override = "🚨 Live Incident Investigation (RCA)"
                        st.rerun()
                st.divider()

    with col_right:
        st.subheader("Service Health & Latency")
        services_data = [
            {"Service": "payment-service", "Status": "🔴 Degraded", "Latency": "8,230ms", "Uptime": "94.2%"},
            {"Service": "auth-service", "Status": "🟡 Investigating", "Latency": "450ms", "Uptime": "98.1%"},
            {"Service": "cache-service", "Status": "🟢 Healthy", "Latency": "4ms", "Uptime": "99.9%"},
            {"Service": "user-service", "Status": "🟢 Healthy", "Latency": "42ms", "Uptime": "99.8%"},
            {"Service": "order-service", "Status": "🟢 Healthy", "Latency": "78ms", "Uptime": "99.7%"},
        ]
        st.dataframe(pd.DataFrame(services_data), use_container_width=True, hide_index=True)
        
        st.subheader("MTTR Trend (Before vs After IncidentMind)")
        mttr_df = pd.DataFrame({
            "Month": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
            "Manual Triage (mins)": [58, 52, 64, 49, 45, 48],
            "IncidentMind AI (mins)": [22, 18, 15, 14, 12, 11]
        })
        fig = px.line(mttr_df, x="Month", y=["Manual Triage (mins)", "IncidentMind AI (mins)"],
                      color_discrete_sequence=["#EF4444", "#10B981"],
                      title="Resolution Time in Minutes")
        fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#9CA3AF")
        st.plotly_chart(fig, use_container_width=True)

# ─── View 2: Live Incident Investigation (RCA) ──────────────────────────────
elif view_selection == "🚨 Live Incident Investigation (RCA)":
    st.title("AI Incident Investigation & Root Cause Analysis")
    st.caption("Autonomous correlation with Google Gemini and Hindsight Vectorized Organizational Memory.")
    
    # Incident Selector
    incident_ids = [inc["id"] for inc in st.session_state.incidents]
    selected_idx = incident_ids.index(st.session_state.selected_incident_id) if st.session_state.selected_incident_id in incident_ids else 0
    
    selected_id = st.selectbox(
        "Select Active or Past Incident to Investigate",
        incident_ids,
        index=selected_idx,
        format_func=lambda x: f"{x} - {next((i['title'] for i in st.session_state.incidents if i['id'] == x), '')}"
    )
    st.session_state.selected_incident_id = selected_id
    
    incident = next(i for i in st.session_state.incidents if i["id"] == selected_id)
    
    # Incident Top Banner
    b1, b2, b3, b4 = st.columns([2, 1, 1, 1])
    with b1:
        st.markdown(f"### {incident['title']}")
        st.caption(f"Service: `{incident['service']}` • Environment: `{incident['environment']}`")
    with b2:
        sev_class = f"badge-{incident['severity'].lower()}"
        st.markdown(f"**Severity:** <br><span class='badge {sev_class}'>{incident['severity']}</span>", unsafe_allow_html=True)
    with b3:
        stat_class = f"badge-{incident['status'].lower()}"
        st.markdown(f"**Status:** <br><span class='badge {stat_class}'>{incident['status']}</span>", unsafe_allow_html=True)
    with b4:
        st.markdown(f"**Time:** <br>`{incident['time']}`", unsafe_allow_html=True)
        
    st.markdown("---")
    
    col_invest_left, col_invest_right = st.columns([1, 1.2])
    
    with col_invest_left:
        st.subheader("1. Incident Telemetry & Logs")
        st.markdown("**Error Signature:**")
        st.code(incident.get("errorMessage", "No explicit error string logged"), language="text")
        
        st.markdown("**Raw Container Logs:**")
        st.markdown(f"<div class='log-box'>{incident.get('logs', 'No logs collected')}</div>", unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        st.subheader("2. Related Historical Memories (Hindsight)")
        st.caption(f"Found {incident.get('memoriesFound', 2)} matching past incidents in company memory.")
        
        # Display matching memories
        matching_memories = [m for m in st.session_state.incidents if m["id"] != incident["id"]][:3]
        for idx, mem in enumerate(matching_memories):
            with st.expander(f"🧠 Match #{idx+1}: {mem['title']} (94% confidence)"):
                st.markdown(f"**Root Cause:** {mem['rootCause']}")
                st.markdown(f"**Proven Fix:** {mem['resolution']}")
                st.markdown(f"<div class='warning-box'><strong>⚠️ Failed Attempts to Avoid:</strong><br>{mem['failedApproaches']}</div>", unsafe_allow_html=True)

    with col_invest_right:
        st.subheader("3. AI Copilot Root Cause Analysis")
        
        investigate_btn = st.button("⚡ Run AI Investigation with Gemini", type="primary", use_container_width=True)
        
        # Check cache
        if investigate_btn or incident["id"] in st.session_state.ai_investigations:
            if investigate_btn or incident["id"] not in st.session_state.ai_investigations:
                with st.spinner("🤖 Gemini analyzing stack traces, logs, and querying Hindsight memories..."):
                    result = run_gemini_investigation(incident, st.session_state.incidents)
                    st.session_state.ai_investigations[incident["id"]] = result
            else:
                result = st.session_state.ai_investigations[incident["id"]]
                
            # Render RCA Output
            st.markdown(f"""
            <div class="rca-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:700; color:#60A5FA;">AI DIAGNOSIS RESULT</span>
                    <span class="badge badge-resolved">Confidence: {result.get('confidenceScore', 95)}%</span>
                </div>
                <p style="margin-top:10px; font-size:1.05rem; line-height:1.5;">{result['rootCauseSummary']}</p>
                <div style="font-size:0.75rem; color:#9CA3AF;">Engine: {result.get('source', 'Gemini AI')}</div>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown("#### 🛠️ Recommended Remediation Steps")
            for step in result.get("recommendedActions", []):
                st.markdown(f"- ✅ **{step}**")
                
            st.markdown("#### 💻 Runbook Commands")
            st.code(result.get("commandsToRun", "# No commands provided"), language="bash")
            
            st.markdown("#### ⚠️ Danger Zone: Failed Approaches to Avoid")
            st.markdown(f"""
            <div class="warning-box">
                {result.get('failedApproachesWarning', 'No warnings recorded')}
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown("#### 🛡️ Permanent Safeguard")
            st.info(result.get("preventionSafeguard", "Automate alerts and healthcheck integration."))
            
            # Action buttons
            col_act1, col_act2 = st.columns(2)
            with col_act1:
                if st.button("Mark Incident as Resolved ✅", use_container_width=True):
                    incident["status"] = "Resolved"
                    st.success(f"{incident['id']} marked as Resolved!")
                    st.rerun()
            with col_act2:
                if st.button("Index into Hindsight Memory 🧠", use_container_width=True):
                    st.toast("Resolution & failed approaches indexed into organizational memory!", icon="🧠")
        else:
            st.info("Click **'Run AI Investigation with Gemini'** to diagnose this incident and retrieve step-by-step resolution commands.")

# ─── View 3: Hindsight Organizational Memory ────────────────────────────────
elif view_selection == "🧠 Hindsight Organizational Memory":
    st.title("Hindsight Organizational Memory")
    st.caption("Vectorized institutional knowledge: learn from past outages, avoid repeating failed approaches.")
    
    search_query = st.text_input("🔍 Semantic Search Past Incidents & Resolutions", placeholder="e.g. database pool exhausted, JWT rotation, Redis eviction")
    
    col_stats1, col_stats2, col_stats3 = st.columns(3)
    col_stats1.metric("Indexed Incidents", len(st.session_state.incidents))
    col_stats2.metric("Saved Engineering Hours", "340 hrs", delta="+12 hrs this week")
    col_stats3.metric("Duplicate Root Cause Rate", "4.2%", delta="-82%", delta_color="inverse")
    
    st.markdown("---")
    
    display_incidents = st.session_state.incidents
    if search_query:
        query_lower = search_query.lower()
        display_incidents = [
            i for i in st.session_state.incidents 
            if query_lower in i["title"].lower() or query_lower in i["rootCause"].lower() or query_lower in i["service"].lower()
        ]
        
    for mem in display_incidents:
        with st.container():
            st.markdown(f"### 📌 {mem['title']}")
            st.caption(f"Service: `{mem['service']}` • MTTR: `{mem.get('resolutionTimeMinutes', 15)} mins` • Severity: `{mem['severity']}`")
            
            c1, c2 = st.columns(2)
            with c1:
                st.markdown(f"""
                <div class="success-box">
                    <strong>✅ Root Cause & Proven Fix:</strong><br>
                    <strong>Cause:</strong> {mem['rootCause']}<br><br>
                    <strong>Resolution:</strong> {mem['resolution']}
                </div>
                """, unsafe_allow_html=True)
            with c2:
                st.markdown(f"""
                <div class="warning-box">
                    <strong>⚠️ Failed Approaches (What Engineers Tried That Failed):</strong><br>
                    {mem['failedApproaches']}
                </div>
                """, unsafe_allow_html=True)
            st.divider()

# ─── View 4: Chaos Simulator & Reporter ─────────────────────────────────────
elif view_selection == "⚡ Chaos Simulator & Reporter":
    st.title("Chaos Simulator & Manual Incident Reporter")
    st.caption("Simulate real-world production failures to test automated AI triage, or report live outages.")
    
    tab1, tab2 = st.tabs(["⚡ Trigger Chaos Simulation", "📝 Report New Incident"])
    
    with tab1:
        st.subheader("Inject Simulated Production Outages")
        sim_col1, sim_col2 = st.columns(2)
        
        with sim_col1:
            st.markdown("#### 1. Payment Database Pool Saturation")
            st.caption("Simulates 500 simultaneous checkout requests hitting an unindexed query, exhausting Postgres connections.")
            if st.button("🔥 Inject Payment DB Outage", type="secondary", use_container_width=True):
                new_inc = {
                    "id": f"INC-{len(st.session_state.incidents)+1:03d}",
                    "title": "Payment API Latency Spike (Simulated)",
                    "service": "payment-service",
                    "environment": "production",
                    "severity": "Critical",
                    "status": "Active",
                    "time": "Just now",
                    "description": "Simulated traffic spike caused 100% pool utilization. Error rate spiked to 35%.",
                    "errorMessage": "TimeoutError: Pool exhausted after 30000ms. Waiting queue: 62.",
                    "logs": "[SIMULATED] CRITICAL: DB connection pool exhausted. Latency > 9000ms.",
                    "rootCause": "Database connection pool exhaustion caused by surge in unindexed transactions.",
                    "resolution": "Increased pool size to 50, added 5s timeout, and deployed index.",
                    "failedApproaches": "Restarting pods or adding replicas multiplies DB connection load.",
                    "resolutionTimeMinutes": 10,
                    "memoriesFound": 4
                }
                st.session_state.incidents.insert(0, new_inc)
                st.session_state.selected_incident_id = new_inc["id"]
                st.success(f"Chaos injected! Incident {new_inc['id']} created.")
                
        with sim_col2:
            st.markdown("#### 2. Redis OOM Cache Collapse")
            st.caption("Simulates Redis exceeding 2Gi memory limit, triggering allkeys-lru key eviction storm.")
            if st.button("💥 Inject Redis Eviction Storm", type="secondary", use_container_width=True):
                new_inc = {
                    "id": f"INC-{len(st.session_state.incidents)+1:03d}",
                    "title": "Redis Cache OOM Collapse (Simulated)",
                    "service": "cache-service",
                    "environment": "production",
                    "severity": "High",
                    "status": "Active",
                    "time": "Just now",
                    "description": "Redis container memory exceeded limit. Key eviction triggered DB CPU spike.",
                    "errorMessage": "OOMKilled: Redis memory exceeded limit 2048MB.",
                    "logs": "[SIMULATED] ERROR: Redis OOMKilled. Cache hit rate dropped to 0%.",
                    "rootCause": "Redis memory limit too low for marketing spike with allkeys-lru policy.",
                    "resolution": "Set memory limit to 8Gi and changed eviction policy to volatile-lru.",
                    "failedApproaches": "Restarting Redis causes cache miss storm on Postgres.",
                    "resolutionTimeMinutes": 8,
                    "memoriesFound": 3
                }
                st.session_state.incidents.insert(0, new_inc)
                st.session_state.selected_incident_id = new_inc["id"]
                st.success(f"Chaos injected! Incident {new_inc['id']} created.")
                
    with tab2:
        st.subheader("Report Production Incident")
        with st.form("new_incident_form"):
            new_title = st.text_input("Incident Title *", placeholder="e.g. Stripe Webhook Processing Delays")
            col_f1, col_f2 = st.columns(2)
            with col_f1:
                new_service = st.selectbox("Affected Service", ["payment-service", "auth-service", "cache-service", "user-service", "order-service", "notification-service"])
            with col_f2:
                new_sev = st.selectbox("Severity Level", ["Critical", "High", "Medium", "Low"])
                
            new_desc = st.text_area("Incident Description", placeholder="What symptoms are users experiencing?")
            new_err = st.text_input("Error Message / Trace", placeholder="e.g. 504 Gateway Timeout")
            new_logs = st.text_area("Relevant Container Logs", placeholder="Paste logs here...")
            
            submit_btn = st.form_submit_button("Submit & Start AI Investigation 🚀", type="primary")
            if submit_btn and new_title:
                created_inc = {
                    "id": f"INC-{len(st.session_state.incidents)+1:03d}",
                    "title": new_title,
                    "service": new_service,
                    "environment": "production",
                    "severity": new_sev,
                    "status": "Active",
                    "time": "Just now",
                    "description": new_desc or "Manual incident logged by on-call engineer.",
                    "errorMessage": new_err or "Unknown error",
                    "logs": new_logs or "No logs provided",
                    "rootCause": "Pending AI investigation...",
                    "resolution": "Pending resolution...",
                    "failedApproaches": "None recorded yet",
                    "resolutionTimeMinutes": 0,
                    "memoriesFound": 2
                }
                st.session_state.incidents.insert(0, created_inc)
                st.session_state.selected_incident_id = created_inc["id"]
                st.success(f"Incident {created_inc['id']} created! Navigate to 'Live Incident Investigation' to run RCA.")

# ─── View 5: Postmortem Analytics & MTTR ─────────────────────────────────────
elif view_selection == "📈 Postmortem Analytics & MTTR":
    st.title("Postmortem Analytics & MTTR Impact")
    st.caption("Quantifying the reduction in incident resolution duration and recurrence prevention.")
    
    col_m1, col_m2, col_m3, col_m4 = st.columns(4)
    col_m1.metric("Historical Incidents", len(st.session_state.incidents))
    col_m2.metric("Avg Resolution Time", "12.4 mins", delta="-32.6 mins", delta_color="inverse")
    col_m3.metric("Cost Savings", "$184,000", delta="+24% YoY")
    col_m4.metric("RCA Accuracy", "94.8%", delta="+4.2%")
    
    st.markdown("---")
    
    c_graph1, c_graph2 = st.columns(2)
    
    with c_graph1:
        st.subheader("Incidents by Service")
        services = [i["service"] for i in st.session_state.incidents]
        service_counts = pd.Series(services).value_counts().reset_index()
        service_counts.columns = ["Service", "Count"]
        fig_pie = px.pie(service_counts, names="Service", values="Count", hole=0.4,
                         color_discrete_sequence=["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"])
        fig_pie.update_layout(paper_bgcolor="rgba(0,0,0,0)", font_color="#9CA3AF")
        st.plotly_chart(fig_pie, use_container_width=True)
        
    with c_graph2:
        st.subheader("Resolution Time per Incident (Minutes)")
        times = [i.get("resolutionTimeMinutes", 10) for i in st.session_state.incidents]
        titles = [i["id"] for i in st.session_state.incidents]
        fig_bar = px.bar(x=titles, y=times, labels={"x": "Incident ID", "y": "Minutes to Resolve"},
                         color=times, color_continuous_scale="Viridis")
        fig_bar.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font_color="#9CA3AF")
        st.plotly_chart(fig_bar, use_container_width=True)

# ─── View 6: Settings & Configuration ───────────────────────────────────────
elif view_selection == "⚙️ Settings & Configuration":
    st.title("System Configuration & AI Settings")
    st.caption("Manage Gemini API credentials and deployment settings.")
    
    with st.container():
        st.subheader("Google Gemini API Key")
        st.markdown("""
        To enable real-time generative AI incident investigation using Gemini 1.5:
        1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com).
        2. Enter the key below, or set it in Streamlit Cloud Secrets as `GEMINI_API_KEY`.
        """)
        
        current_key = get_gemini_api_key() or ""
        masked_key = f"{current_key[:6]}...{current_key[-4:]}" if len(current_key) > 10 else current_key
        
        user_key = st.text_input("Enter GEMINI_API_KEY", value="", type="password", placeholder="AIzaSy...")
        if st.button("Save API Key"):
            if user_key:
                st.session_state.user_gemini_key = user_key
                st.session_state.demo_mode = False
                st.success("API Key saved for this session!")
            else:
                st.session_state.user_gemini_key = None
                st.session_state.demo_mode = True
                st.info("API Key cleared. Running in Demo Mode.")
                
        st.markdown("---")
        st.subheader("Mode Selection")
        st.session_state.demo_mode = st.toggle("Force Demo / Offline Mode", value=st.session_state.demo_mode, 
                                               help="When enabled, uses realistic built-in responses without consuming API credits.")
        
        st.markdown("---")
        if st.button("🔄 Reset Demo Incidents to Defaults"):
            st.session_state.incidents = DEFAULT_INCIDENTS
            st.session_state.ai_investigations = {}
            st.success("Demo dataset reset to initial state!")
            st.rerun()

# Footer
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: #6B7280; font-size: 0.8rem;'>"
    "IncidentMind AI • Powered by Streamlit, Google Gemini & Hindsight Vectorize • Designed for SRE & DevOps Teams"
    "</div>",
    unsafe_allow_html=True
)
