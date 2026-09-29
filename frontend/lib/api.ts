import type {
  Incident,
  Memory,
  InvestigationResult,
  Analytics,
  DemoResult,
  ResolutionInput,
  IncidentInput,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ─── Demo Data ───────────────────────────────────────────────────────────────

export const DEMO_MEMORIES: Memory[] = [
  {
    id: 'mem-001',
    incidentId: 'INC-087',
    title: 'Payment API High Latency - DB Connection Exhaustion',
    service: 'Payment API',
    severity: 'Critical',
    rootCause: 'Database connection pool exhaustion under peak load',
    resolution: 'Increased connection pool size from 10 to 50, added connection timeout handling',
    failedApproaches: ['Service restart', 'Horizontal pod scaling', 'Cache flush'],
    resolutionTime: 23,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 94,
    tags: ['latency', 'database', 'connection-pool'],
  },
  {
    id: 'mem-002',
    incidentId: 'INC-104',
    title: 'Payment API Timeout Storm',
    service: 'Payment API',
    severity: 'Critical',
    rootCause: 'Connection pool saturation causing cascading timeouts',
    resolution: 'Applied connection pool limits and circuit breaker pattern',
    failedApproaches: ['Load balancer reconfiguration'],
    resolutionTime: 18,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 91,
    tags: ['timeout', 'circuit-breaker', 'connection-pool'],
  },
  {
    id: 'mem-003',
    incidentId: 'INC-114',
    title: 'Auth Service JWT Failures After Secret Rotation',
    service: 'Auth Service',
    severity: 'High',
    rootCause: 'JWT secret rotation without rolling update caused auth failures',
    resolution: 'Rolled back secret rotation, implemented graceful rotation with dual-secret support',
    failedApproaches: ['Force re-authentication', 'Token cache invalidation only'],
    resolutionTime: 35,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 88,
    tags: ['auth', 'jwt', 'secret-rotation'],
  },
  {
    id: 'mem-004',
    incidentId: 'INC-121',
    title: 'Redis Cache Cluster OOM During Flash Sale',
    service: 'Redis Cache',
    severity: 'High',
    rootCause: 'Memory limit exceeded during high-traffic event, eviction policy misconfigured',
    resolution: 'Updated maxmemory-policy to allkeys-lru, increased memory limits',
    failedApproaches: ['Cache flush (caused worse thundering herd)', 'Connection pool reset'],
    resolutionTime: 15,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 76,
    tags: ['redis', 'memory', 'oom', 'high-traffic'],
  },
  {
    id: 'mem-005',
    incidentId: 'INC-128',
    title: 'Database Replica Lag Causing Read Failures',
    service: 'Database',
    severity: 'High',
    rootCause: 'Replica lag exceeded max_allowed_packet causing sync failures',
    resolution: 'Promoted replica to primary, adjusted max_allowed_packet to 128M',
    failedApproaches: ['Query optimization alone', 'Read traffic rerouting'],
    resolutionTime: 42,
    outcome: 'Partial',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 72,
    tags: ['database', 'replica', 'lag'],
  },
  {
    id: 'mem-006',
    incidentId: 'INC-095',
    title: 'API Gateway 502 Surge After Deployment',
    service: 'API Gateway',
    severity: 'Critical',
    rootCause: 'New deployment missing environment variable, causing upstream connect failures',
    resolution: 'Rolled back deployment, added env var validation in CI pipeline',
    failedApproaches: ['Gateway cache clear', 'SSL cert rotation'],
    resolutionTime: 12,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 65,
    tags: ['api-gateway', 'deployment', 'env-var'],
  },
  {
    id: 'mem-007',
    incidentId: 'INC-110',
    title: 'Kubernetes Pod CrashLoopBackOff - OOMKilled',
    service: 'Kubernetes',
    severity: 'High',
    rootCause: 'Memory limit too low for new workload after traffic increase',
    resolution: 'Increased memory limits, set VPA for automatic scaling',
    failedApproaches: ['Pod restart', 'Node drain and reschedule'],
    resolutionTime: 20,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 58,
    tags: ['kubernetes', 'oom', 'memory-limit'],
  },
  {
    id: 'mem-008',
    incidentId: 'INC-117',
    title: 'CDN Cache Poisoning Attack',
    service: 'CDN',
    severity: 'Critical',
    rootCause: 'Missing cache key normalization allowed attacker to poison responses',
    resolution: 'Emergency cache purge, added Vary headers, deployed cache key rules',
    failedApproaches: ['Rate limiting alone', 'IP blocking'],
    resolutionTime: 67,
    outcome: 'Success',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    similarity: 45,
    tags: ['cdn', 'security', 'cache-poisoning'],
  },
];

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'INC-129',
    title: 'Payment API Response Time Spike',
    service: 'Payment API',
    environment: 'Production',
    severity: 'Critical',
    status: 'Investigating',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'P99 latency exceeded 5000ms threshold. Multiple payment timeouts reported.',
    rootCause: 'Database connection pool exhaustion',
    resolution: 'Increased connection pool size',
    resolutionTime: 18,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'INC-128',
    title: 'Auth Service Login Failures',
    service: 'Auth Service',
    environment: 'Production',
    severity: 'High',
    status: 'Open',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    errorMessage: '401 errors spiking. JWT validation failures across multiple endpoints.',
    rootCause: 'JWT secret rotation without rolling update',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'INC-127',
    title: 'Redis Cache Memory Exhaustion',
    service: 'Redis Cache',
    environment: 'Production',
    severity: 'High',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Redis OOM errors. Cache miss rate 95%+.',
    rootCause: 'Memory limit exceeded, eviction policy misconfigured',
    resolution: 'Updated maxmemory-policy, increased memory limits',
    resolutionTime: 15,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-126',
    title: 'Database Replica Lag > 30s',
    service: 'Database',
    environment: 'Production',
    severity: 'High',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Replica lag exceeded 30 seconds causing stale reads.',
    rootCause: 'max_allowed_packet too low',
    resolution: 'Adjusted max_allowed_packet to 128M, promoted replica',
    resolutionTime: 42,
    resolutionResult: 'Partial',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-125',
    title: 'API Gateway 502 Bad Gateway Errors',
    service: 'API Gateway',
    environment: 'Production',
    severity: 'Critical',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: '502 errors affecting all downstream services.',
    rootCause: 'Missing environment variable in deployment',
    resolution: 'Rolled back deployment, added env var validation',
    resolutionTime: 12,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-124',
    title: 'Kubernetes Pods CrashLoopBackOff',
    service: 'Kubernetes',
    environment: 'Production',
    severity: 'High',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: '12 pods in CrashLoopBackOff state. OOMKilled.',
    rootCause: 'Memory limits too low after traffic increase',
    resolution: 'Increased memory limits, configured VPA',
    resolutionTime: 20,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 115 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-123',
    title: 'CDN Cache Poisoning Detected',
    service: 'CDN',
    environment: 'Production',
    severity: 'Critical',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Malicious responses being served from cache. User reports of redirects.',
    rootCause: 'Missing cache key normalization',
    resolution: 'Emergency cache purge, added Vary headers',
    resolutionTime: 67,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 160 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-122',
    title: 'Third-party Payment Gateway Timeout',
    service: 'Third-party API',
    environment: 'Production',
    severity: 'Medium',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Stripe API returning 503 for 40% of requests.',
    rootCause: 'Stripe platform outage, no circuit breaker',
    resolution: 'Implemented circuit breaker, added fallback payment flow',
    resolutionTime: 89,
    resolutionResult: 'Partial',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 230 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-121',
    title: 'Redis Flash Sale OOM',
    service: 'Redis Cache',
    environment: 'Production',
    severity: 'High',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Redis OOM during flash sale event. 95% cache miss rate.',
    rootCause: 'Memory limit exceeded during high-traffic event',
    resolution: 'Updated eviction policy, increased memory limits',
    resolutionTime: 15,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 330 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-120',
    title: 'Auth Service 5xx Spike',
    service: 'Auth Service',
    environment: 'Production',
    severity: 'Critical',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Auth service returning 500 errors on 30% of login attempts.',
    rootCause: 'Database deadlock during session table updates',
    resolution: 'Killed deadlocked transactions, added retry logic',
    resolutionTime: 28,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 430 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-119',
    title: 'Payment API SSL Certificate Expired',
    service: 'Payment API',
    environment: 'Production',
    severity: 'Critical',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'SSL certificate expired, all payment connections failing.',
    rootCause: 'Certificate renewal automation failed silently',
    resolution: 'Renewed certificate, fixed automation monitoring',
    resolutionTime: 8,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 500 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-118',
    title: 'Database Connection Pool Exhaustion',
    service: 'Database',
    environment: 'Production',
    severity: 'High',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Too many connections error. New connections refused.',
    rootCause: 'Long-running analytics queries holding connections',
    resolution: 'Killed long-running queries, increased max_connections, separated read replica',
    resolutionTime: 35,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 600 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-117',
    title: 'CDN Cache Poisoning Attack',
    service: 'CDN',
    environment: 'Production',
    severity: 'Critical',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Users receiving incorrect cached responses. Security incident triggered.',
    rootCause: 'Missing cache key normalization allowed cache poisoning',
    resolution: 'Cache purge, Vary headers, cache key normalization rules',
    resolutionTime: 67,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 720 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-116',
    title: 'Kubernetes Namespace Resource Quota Exceeded',
    service: 'Kubernetes',
    environment: 'Staging',
    severity: 'Medium',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'New pods failing to schedule. Resource quota exceeded.',
    rootCause: 'Resource quota too restrictive for new service deployment',
    resolution: 'Increased namespace resource quota, cleaned up unused deployments',
    resolutionTime: 10,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 840 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INC-115',
    title: 'API Gateway Rate Limiting Misconfiguration',
    service: 'API Gateway',
    environment: 'Production',
    severity: 'Medium',
    status: 'Resolved',
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    errorMessage: 'Legitimate users being rate limited. Support tickets spiking.',
    rootCause: 'Rate limit threshold too low after traffic pattern change',
    resolution: 'Adjusted rate limits per endpoint, added user-specific overrides',
    resolutionTime: 22,
    resolutionResult: 'Resolved',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 960 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_ANALYTICS: Analytics = {
  totalIncidents: 128,
  resolvedIncidents: 94,
  avgResolutionTime: 18,
  memoryCount: 128,
  knowledgeGrowth: 27,
  incidentsByMonth: [
    { month: 'Apr', count: 18 },
    { month: 'May', count: 22 },
    { month: 'Jun', count: 15 },
    { month: 'Jul', count: 28 },
    { month: 'Aug', count: 20 },
    { month: 'Sep', count: 25 },
  ],
  rootCauseDistribution: [
    { name: 'DB Connection Issues', value: 32, color: '#3b82f6' },
    { name: 'Memory Exhaustion', value: 24, color: '#8b5cf6' },
    { name: 'Auth/JWT Failures', value: 18, color: '#10b981' },
    { name: 'Deployment Config', value: 20, color: '#f59e0b' },
    { name: 'Third-party Outage', value: 16, color: '#ef4444' },
    { name: 'Network Issues', value: 18, color: '#06b6d4' },
  ],
  resolutionTimeByService: [
    { service: 'Payment API', avgTime: 23 },
    { service: 'Auth Service', avgTime: 31 },
    { service: 'Redis Cache', avgTime: 14 },
    { service: 'Database', avgTime: 38 },
    { service: 'API Gateway', avgTime: 12 },
    { service: 'Kubernetes', avgTime: 22 },
    { service: 'CDN', avgTime: 55 },
  ],
  memoryGrowthOverTime: [
    { month: 'Apr', memories: 18 },
    { month: 'May', memories: 40 },
    { month: 'Jun', memories: 55 },
    { month: 'Jul', memories: 83 },
    { month: 'Aug', memories: 103 },
    { month: 'Sep', memories: 128 },
  ],
  severityDistribution: [
    { severity: 'Critical', count: 38 },
    { severity: 'High', count: 52 },
    { severity: 'Medium', count: 28 },
    { severity: 'Low', count: 10 },
  ],
};

function generateInvestigationResult(
  service: string,
  memories: Memory[]
): InvestigationResult {
  const memoryCount = memories.length;

  if (service === 'Payment API') {
    return {
      summary: `Payment API is experiencing elevated latency and timeout errors. Based on ${memoryCount} historical incidents in Hindsight memory, this pattern strongly correlates with database connection pool exhaustion — a recurring issue in this service.`,
      likelyCauses: [
        'Database connection pool exhausted under current load',
        'Long-running queries holding connections open',
        'Missing connection timeout configuration',
        'Traffic spike exceeding pool capacity',
      ],
      investigationSteps: [
        'Check current DB connection count: `SHOW STATUS LIKE "Threads_connected"`',
        'Review active queries: `SHOW PROCESSLIST` — look for long-running queries',
        'Check connection pool metrics in APM dashboard',
        'Verify connection timeout settings in application config',
        'Review recent traffic patterns and compare to connection pool size',
      ],
      recommendedActions: [
        'Immediately increase connection pool size from 10 → 50 (worked in INC-087)',
        'Kill any long-running queries consuming connections',
        'Apply circuit breaker to prevent cascade failures',
        'Deploy connection timeout configuration change',
        'Enable connection pool metrics alerting',
      ],
      warnings: [
        '⚠️ Service restart did NOT resolve this in INC-087 — skip that step',
        '⚠️ Horizontal pod scaling alone will NOT help if the bottleneck is DB connections',
        '⚠️ Cache flush made things worse in INC-121 — avoid during active incident',
      ],
      whyThisRecommendation: `Based on ${memoryCount} previous incidents stored in Hindsight. INC-087 and INC-104 show identical symptom patterns (latency spike + timeout storm) both resolved by connection pool expansion. Confidence is high due to service match and error pattern similarity.`,
      confidenceScore: 92,
      memoriesUsed: memories,
      memoryCount,
      source: 'demo',
    };
  }

  if (service === 'Auth Service') {
    return {
      summary: `Auth Service is experiencing JWT validation failures. Hindsight memory recalls a nearly identical incident (INC-114) triggered by JWT secret rotation without proper rolling update support.`,
      likelyCauses: [
        'JWT secret rotated without dual-secret support',
        'Token cache not updated after secret rotation',
        'Race condition between old and new JWT validation',
        'Clock skew between auth service instances',
      ],
      investigationSteps: [
        'Check recent secret rotation events in deployment logs',
        'Verify JWT validation configuration across all auth service replicas',
        'Review token expiry and issued-at timestamps',
        'Check if dual-secret (old + new) validation is enabled',
        'Compare error rate with deployment timeline',
      ],
      recommendedActions: [
        'Roll back JWT secret rotation immediately',
        'Implement dual-secret validation (accept old AND new tokens during transition)',
        'Coordinate rolling update with traffic shifting',
        'Invalidate affected token cache selectively, not globally',
      ],
      warnings: [
        '⚠️ Global token cache invalidation worsened the issue in INC-114 — avoid',
        '⚠️ Force re-authentication of all users caused extreme UX impact previously',
      ],
      whyThisRecommendation: `INC-114 in Hindsight is a 88% match. Same service, same error pattern, same trigger (secret rotation). Resolution time was 35 minutes using the dual-secret rollback approach.`,
      confidenceScore: 85,
      memoriesUsed: memories,
      memoryCount,
      source: 'demo',
    };
  }

  return {
    summary: `Incident detected on ${service}. Analysis in progress based on ${memoryCount} historical memories found in Hindsight.`,
    likelyCauses: [
      'Configuration change or deployment in the last 2 hours',
      'Resource exhaustion (memory, connections, or disk)',
      'Dependency failure from upstream service',
      'Traffic anomaly exceeding capacity',
    ],
    investigationSteps: [
      'Review recent deployments and configuration changes',
      'Check resource utilization metrics (CPU, memory, disk)',
      'Inspect error logs for specific error codes',
      'Verify upstream dependencies health status',
      'Check network connectivity and DNS resolution',
    ],
    recommendedActions: [
      'Collect full error logs and stack traces',
      'Review recent change log for the service',
      'Check monitoring dashboards for correlated anomalies',
      'Engage the owning team with collected diagnostics',
    ],
    warnings: memoryCount > 0
      ? [`⚠️ ${memoryCount} similar incidents found — review failed approaches before attempting fixes`]
      : [],
    whyThisRecommendation: `Analysis based on ${memoryCount} relevant historical incidents from Hindsight memory.`,
    confidenceScore: memoryCount > 3 ? 74 : 52,
    memoriesUsed: memories,
    memoryCount,
    source: 'demo',
  };
}

// ─── API Client Functions ─────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function createIncident(data: IncidentInput): Promise<{ id: string }> {
  try {
    return await apiFetch<{ id: string }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    // Demo fallback: generate a fake incident id
    const id = `INC-${Math.floor(Math.random() * 900) + 100}`;
    return { id };
  }
}

export async function investigateIncident(
  id: string,
  service?: string
): Promise<InvestigationResult> {
  try {
    return await apiFetch<InvestigationResult>(`/incidents/${id}/investigate`, {
      method: 'POST',
    });
  } catch {
    // Demo fallback: use demo memories
    const svc = service || 'Payment API';
    const memories = DEMO_MEMORIES.filter(m =>
      m.service === svc || Math.random() > 0.6
    ).slice(0, 5);
    return generateInvestigationResult(svc, memories);
  }
}

export async function resolveIncident(
  id: string,
  resolution: ResolutionInput
): Promise<void> {
  try {
    await apiFetch(`/incidents/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  } catch {
    // Demo: silently succeed
    return;
  }
}

export async function getIncidents(): Promise<Incident[]> {
  try {
    return await apiFetch<Incident[]>('/incidents');
  } catch {
    return DEMO_INCIDENTS;
  }
}

export async function getIncident(id: string): Promise<Incident> {
  try {
    return await apiFetch<Incident>(`/incidents/${id}`);
  } catch {
    const found = DEMO_INCIDENTS.find(i => i.id === id);
    if (found) return found;
    return DEMO_INCIDENTS[0];
  }
}

export async function getMemories(): Promise<Memory[]> {
  try {
    return await apiFetch<Memory[]>('/memories');
  } catch {
    return DEMO_MEMORIES;
  }
}

export async function getAnalytics(): Promise<Analytics> {
  try {
    return await apiFetch<Analytics>('/analytics');
  } catch {
    return DEMO_ANALYTICS;
  }
}

export async function recallMemory(query: string): Promise<Memory[]> {
  try {
    return await apiFetch<Memory[]>('/memory/recall', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  } catch {
    return DEMO_MEMORIES.slice(0, 3);
  }
}

export async function runDemoSequence(): Promise<DemoResult> {
  try {
    return await apiFetch<DemoResult>('/demo/run');
  } catch {
    const paymentMemories = DEMO_MEMORIES.filter(m => m.service === 'Payment API');
    const incident1: Incident = {
      id: 'DEMO-001',
      title: 'Payment API High Latency (First Incident)',
      service: 'Payment API',
      environment: 'Production',
      severity: 'Critical',
      status: 'Investigating',
      timestamp: new Date().toISOString(),
      errorMessage: 'P99 latency > 5000ms. Users experiencing payment timeouts.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const incident2: Incident = {
      id: 'DEMO-002',
      title: 'Payment API Latency Storm (Second Incident)',
      service: 'Payment API',
      environment: 'Production',
      severity: 'Critical',
      status: 'Investigating',
      timestamp: new Date().toISOString(),
      errorMessage: 'Latency spike above 4000ms. Same symptoms as before.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      step1: {
        incident: incident1,
        investigation: generateInvestigationResult('Payment API', []),
        memories: [],
      },
      step2: {
        incident: incident2,
        investigation: generateInvestigationResult('Payment API', paymentMemories),
        memories: paymentMemories,
      },
    };
  }
}
