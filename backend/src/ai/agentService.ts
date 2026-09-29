import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { MemoryResult } from '../hindsight/memoryService';
import { sanitizeIncidentForAI } from '../utils/sanitizer';

export interface IncidentInput {
  id: string;
  title: string;
  service: string;
  environment: string;
  severity: string;
  description: string;
  errorMessage?: string;
  logs?: string;
}

export interface AgentResponse {
  summary: string;
  likelyCauses: string[];
  historicalMatches: {
    incidentId: string;
    similarity: string;
    relevance: string;
  }[];
  recommendedSteps: string[];
  recommendedActions: string[];
  warningsFromHistory: string[];
  confidence: number;
  memoryExplanation: string;
  rawMemoriesUsed: number;
}

export class AIAgentService {
  private model: GenerativeModel | null = null;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.isConfigured = !!apiKey;

    if (this.isConfigured) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('[AI Agent] Gemini 1.5 Flash initialized');
    } else {
      console.log('[AI Agent] Running in demo mode (no Gemini API key)');
    }
  }

  async investigateIncident(
    incident: IncidentInput,
    memories: MemoryResult[]
  ): Promise<AgentResponse> {
    const cleanIncident = sanitizeIncidentForAI(incident as any) as IncidentInput;

    if (!this.isConfigured || !this.model) {
      return this.buildDemoResponse(cleanIncident, memories);
    }

    try {
      const prompt = this.buildPrompt(cleanIncident, memories);
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.parseGeminiResponse(text, memories);
    } catch (e: any) {
      console.error('[AI Agent] Gemini error:', e?.message);
      return this.buildDemoResponse(cleanIncident, memories);
    }
  }

  private buildPrompt(incident: IncidentInput, memories: MemoryResult[]): string {
    const memoriesText =
      memories.length > 0
        ? memories
            .map(
              (m, i) => `
--- Historical Incident ${i + 1} (Similarity: ${(m.similarity * 100).toFixed(0)}%) ---
ID: ${m.id}
Title: ${m.title}
Service: ${m.service}
Root Cause: ${m.rootCause}
Resolution: ${m.resolution}
Failed Approaches (DO NOT repeat these): ${m.failedApproaches}
Resolution Time: ${m.resolutionTimeMinutes} minutes
Outcome: ${m.outcome}
`
            )
            .join('\n')
        : 'No historical incidents found in memory.';

    return `You are IncidentMind AI, an expert incident response engineer with deep knowledge of distributed systems, databases, and cloud infrastructure. You have access to a historical memory of past incidents.

## CURRENT INCIDENT
ID: ${incident.id}
Title: ${incident.title}
Service: ${incident.service}
Environment: ${incident.environment}
Severity: ${incident.severity}
Description: ${incident.description}
${incident.errorMessage ? `Error Message: ${incident.errorMessage}` : ''}
${incident.logs ? `Recent Logs:\n${incident.logs.substring(0, 1000)}` : ''}

## HISTORICAL MEMORY (from Hindsight)
${memoriesText}

## INSTRUCTIONS
Analyze this incident using the historical memory provided. You MUST:
1. Identify the most likely root causes based on the symptoms and error messages
2. Explicitly reference historical incidents by their ID when they are relevant
3. Warn about approaches that FAILED in similar past incidents
4. Provide specific, actionable remediation steps
5. Assign a confidence score (0-100) based on how well historical data matches

Return ONLY a valid JSON object (no markdown, no explanation outside JSON):

{
  "summary": "2-3 sentence executive summary of what is happening and what to do",
  "likelyCauses": ["cause 1", "cause 2", "cause 3"],
  "historicalMatches": [
    {"incidentId": "INC-XXX", "similarity": "85%", "relevance": "Why this historical incident is relevant"}
  ],
  "recommendedSteps": [
    "Step 1: Immediate action to take right now",
    "Step 2: Next diagnostic step",
    "Step 3: Remediation action"
  ],
  "recommendedActions": [
    "Action item 1 (specific command or configuration change)",
    "Action item 2"
  ],
  "warningsFromHistory": [
    "WARNING: Based on INC-XXX, do NOT do X because it caused Y"
  ],
  "confidence": 85,
  "memoryExplanation": "Explanation of how historical incidents informed this analysis"
}`;
  }

  private parseGeminiResponse(text: string, memories: MemoryResult[]): AgentResponse {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
      const jsonStr = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonStr.trim());

      return {
        summary: parsed.summary || 'AI analysis complete.',
        likelyCauses: Array.isArray(parsed.likelyCauses) ? parsed.likelyCauses : [],
        historicalMatches: Array.isArray(parsed.historicalMatches) ? parsed.historicalMatches : [],
        recommendedSteps: Array.isArray(parsed.recommendedSteps) ? parsed.recommendedSteps : [],
        recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
        warningsFromHistory: Array.isArray(parsed.warningsFromHistory) ? parsed.warningsFromHistory : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
        memoryExplanation: parsed.memoryExplanation || '',
        rawMemoriesUsed: memories.length,
      };
    } catch (e) {
      console.error('[AI Agent] Failed to parse Gemini response:', e);
      return this.buildFallbackResponse(memories);
    }
  }

  private buildDemoResponse(incident: IncidentInput, memories: MemoryResult[]): AgentResponse {
    const title = incident.title.toLowerCase();
    const description = incident.description.toLowerCase();
    const errorMsg = (incident.errorMessage || '').toLowerCase();
    const combined = `${title} ${description} ${errorMsg}`;

    // Smart pattern-based diagnosis
    let likelyCauses: string[] = [];
    let recommendedSteps: string[] = [];
    let recommendedActions: string[] = [];
    let warningsFromHistory: string[] = [];
    let summary = '';
    let confidence = 70;

    const isPayment = combined.includes('payment');
    const isLatency = combined.includes('latency') || combined.includes('slow') || combined.includes('timeout');
    const isPool = combined.includes('pool') || combined.includes('connection');
    const isMemory = combined.includes('memory') || combined.includes('oom') || combined.includes('heap');
    const isAuth = combined.includes('auth') || combined.includes('jwt') || combined.includes('token');
    const isCache = combined.includes('cache') || combined.includes('redis');
    const isDB = combined.includes('database') || combined.includes('postgres') || combined.includes('mysql') || combined.includes('deadlock');
    const isQueue = combined.includes('queue') || combined.includes('kafka') || combined.includes('message');
    const isDeploy = combined.includes('deploy') || combined.includes('crash') || combined.includes('config');
    const isSSL = combined.includes('ssl') || combined.includes('cert') || combined.includes('tls');

    if (isLatency && isPayment && (isPool || isDB)) {
      confidence = 92;
      summary = `This payment service latency spike is highly similar to INC-001 and INC-011 from historical memory. The pattern strongly suggests database connection pool exhaustion combined with slow queries holding connections longer than expected. Immediate action: check pool utilization and run EXPLAIN on recent slow queries.`;
      likelyCauses = [
        'Database connection pool exhaustion (pool maxed out, new requests queuing)',
        'Slow query introduced in recent deployment holding connections open',
        'Traffic spike exceeding current pool capacity without autoscaling',
        'Missing database index causing full table scans on high-traffic queries',
      ];
      recommendedSteps = [
        'IMMEDIATE: Check DB connection pool utilization — if >80%, increase pool size temporarily',
        'Run EXPLAIN ANALYZE on the slowest recent queries to identify missing indexes',
        'Check for any deployments in the last 2 hours that may have introduced query regressions',
        'Monitor payment service logs for "pool exhausted" or "connection timeout" errors',
        'Consider rate-limiting non-critical payment endpoints to reduce DB pressure',
        'After stabilization: implement PgBouncer or similar connection pooler',
      ];
      recommendedActions = [
        'kubectl exec -it <payment-pod> -- sh -c "env | grep DB_POOL" to check current pool settings',
        'SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;',
        'kubectl scale deployment payment-service --replicas=1 if DB connection ceiling hit',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_created ON payments(user_id, created_at DESC);',
      ];
      warningsFromHistory = [
        'WARNING (from INC-001): Do NOT simply restart pods — root cause is the DB pool, not the pod. Restart provides temporary relief but issue returns immediately.',
        'WARNING (from INC-001): Horizontal scaling without fixing the pool will WORSEN contention on DB connections.',
        'WARNING (from INC-014): If this is Black Friday / high-traffic event, pool increase alone is insufficient — fix slow queries FIRST.',
        'WARNING (from INC-011): Disabling query cache had no effect in a previous similar incident — skip this step.',
      ];
    } else if (isMemory || (combined.includes('oom') || combined.includes('killed'))) {
      confidence = 85;
      summary = `Memory exhaustion detected. Based on INC-008 and INC-012, this could be an EventEmitter leak (Node.js) or insufficient memory limits for the actual runtime requirements. Immediate action: take a heap dump and check memory trends over the last 24 hours.`;
      likelyCauses = [
        'EventEmitter listeners added without cleanup (Node.js memory leak)',
        'Memory limits set based on idle usage, not peak load requirements',
        'Unclosed database cursors or connection handles accumulating over time',
        'Large in-memory data structures not garbage collected due to unintentional references',
      ];
      recommendedSteps = [
        'IMMEDIATE: Take heap dump: kill -USR2 <pid> or use --inspect flag for Node.js heap snapshot',
        'Check memory growth trend: is it linear (leak) or sudden (limit misconfiguration)?',
        'Review recent code changes for event listeners, timers, or streams not cleaned up',
        'Check container memory limits vs actual memory requirements under load',
        'Temporarily increase memory limit to prevent OOMKill while investigating',
      ];
      recommendedActions = [
        'kubectl top pod <pod-name> --containers to see current memory usage',
        'node --expose-gc --inspect app.js to enable heap profiling',
        'grep -n "\.on\(" src/ -r | grep -v "\.once\(" to find persistent event listeners',
        'kubectl set resources deployment/<name> --limits=memory=2Gi to increase limits temporarily',
      ];
      warningsFromHistory = [
        'WARNING (from INC-008): Increasing memory limits is a band-aid — it only delays the crash. Find and fix the leak.',
        'WARNING (from INC-008): Forcing GC manually provides only temporary relief.',
        'WARNING (from INC-012): Memory limits must account for model/data load + runtime overhead + peak batch memory.',
      ];
    } else if (isAuth) {
      confidence = 88;
      summary = `Authentication service issue detected. This matches the pattern of INC-002 where JWT secret rotation invalidated all active sessions simultaneously. Check if any recent secret rotation or key changes occurred.`;
      likelyCauses = [
        'JWT secret rotation without overlap/grace period for existing tokens',
        'Auth service configuration changed without restarting dependent services',
        'Token signing algorithm mismatch between issuer and validator',
        'Clock skew between services causing token expiry validation failures',
      ];
      recommendedSteps = [
        'IMMEDIATE: Check if JWT secret was recently rotated — if yes, implement dual-secret validation',
        'Verify auth service logs for "invalid signature" vs "expired" errors to distinguish token types',
        'Check clock synchronization across all services (NTP drift can cause false expiry)',
        'Implement 15-minute overlap window accepting both old and new JWT secrets during rotation',
      ];
      recommendedActions = [
        'kubectl logs -l app=auth-service --tail=100 | grep -E "invalid|expired|signature"',
        'Add AUTH_SECRET_OLD env var and update validator to accept both secrets during transition',
        'date && kubectl exec <pod> -- date to check for clock drift between local and pod',
      ];
      warningsFromHistory = [
        'WARNING (from INC-002): DO NOT rotate JWT secret without implementing overlap window. All users will be logged out simultaneously.',
        'WARNING (from INC-002): Rolling back the secret rotation may not be possible due to security requirements — plan for the dual-validation approach.',
      ];
    } else if (isCache) {
      confidence = 82;
      summary = `Cache layer failure detected. Based on INC-003, this is likely Redis memory exhaustion with aggressive key eviction. Immediate action: check Redis memory usage and current eviction policy.`;
      likelyCauses = [
        'Redis memory limit exceeded, triggering key eviction (allkeys-lru evicting all including sessions)',
        'Sudden traffic spike filling cache faster than expiry rate',
        'Cache stampede: all keys expire simultaneously causing DB overload',
        'Redis OOM restart causing cold cache and DB overload',
      ];
      recommendedSteps = [
        'IMMEDIATE: Check Redis memory: redis-cli INFO memory | grep used_memory',
        'Check eviction policy: redis-cli CONFIG GET maxmemory-policy',
        'Change eviction policy from allkeys-lru to volatile-lru to protect non-expiring keys',
        'Increase Redis maxmemory and add memory alerts at 80% threshold',
      ];
      recommendedActions = [
        'redis-cli INFO memory | grep -E "used_memory_human|maxmemory_human|evicted_keys"',
        'redis-cli CONFIG SET maxmemory-policy volatile-lru',
        'redis-cli CONFIG SET maxmemory 8gb',
        'kubectl set resources deployment/redis --limits=memory=8Gi',
      ];
      warningsFromHistory = [
        'WARNING (from INC-003): Restarting Redis causes complete cache miss storm on all services — expect 10x DB load temporarily.',
        'WARNING (from INC-003): Reducing TTL values will worsen the cache miss problem, not help.',
      ];
    } else if (isQueue) {
      confidence = 80;
      summary = `Message queue processing issue detected. Based on INC-007, this is likely a consumer group rebalance storm caused by unhealthy consumers repeatedly rejoining. Check consumer liveness probes and rebalance frequency.`;
      likelyCauses = [
        'Consumer group rebalance storm preventing any partition from being processed',
        'Liveness probe timeout too short for slow message processing, causing false restarts',
        'Consumer group lag growing faster than processing capacity',
        'Partition count mismatch with consumer count causing uneven load',
      ];
      recommendedSteps = [
        'IMMEDIATE: Check consumer group status and rebalance count',
        'Identify if consumers are restarting frequently (CrashLoopBackOff or frequent restarts)',
        'Temporarily increase consumer replicas to catch up on lag',
        'Fix liveness probe timeout to be longer than maximum message processing time',
      ];
      recommendedActions = [
        'kafka-consumer-groups.sh --describe --group <group-name> --bootstrap-server kafka:9092',
        'kubectl get pods -l app=<consumer> --watch to observe restart frequency',
        'kubectl patch deployment <consumer> --type=json -p \'[{"op":"replace","path":"/spec/template/spec/containers/0/livenessProbe/timeoutSeconds","value":30}]\'',
        'kubectl scale deployment <consumer> --replicas=12 to increase parallelism',
      ];
      warningsFromHistory = [
        'WARNING (from INC-007): Increasing consumer replicas BEFORE fixing rebalance storm will make it WORSE — more consumers = more rebalances.',
        'WARNING (from INC-007): Resetting consumer offsets will lose messages — avoid this.',
        'WARNING (from INC-007): Deleting and recreating the consumer group causes message duplication.',
      ];
    } else if (isDeploy) {
      confidence = 87;
      summary = `Deployment failure detected. Based on INC-005, this is likely a missing configuration (env var, secret, or configmap) in the target namespace. Immediate action: rollback now, then investigate the missing configuration.`;
      likelyCauses = [
        'Missing required environment variable or Kubernetes secret in target namespace',
        'Configuration drift between staging and production namespaces',
        'New service dependency not available in production environment',
        'Incompatible configuration format in new version',
      ];
      recommendedSteps = [
        'IMMEDIATE: Roll back deployment: kubectl rollout undo deployment/<service-name>',
        'Check pod logs for the exact missing configuration: kubectl logs <crashlooping-pod>',
        'Verify all required secrets exist in the production namespace',
        'After rollback is stable, create missing configuration and re-deploy',
      ];
      recommendedActions = [
        'kubectl rollout undo deployment/<service-name> --to-revision=0',
        'kubectl logs <pod-name> --previous to see crash logs',
        'kubectl get secrets -n production to verify required secrets exist',
        'kubectl describe pod <pod-name> to see environment variable injection failures',
      ];
      warningsFromHistory = [
        'WARNING (from INC-005): Do NOT try to patch the failing deployment while pods are in CrashLoopBackOff — rollback first.',
        'WARNING (from INC-005): Forward-deploying a hotfix is high-risk during an active incident — stick to rollback.',
      ];
    } else if (isSSL) {
      confidence = 95;
      summary = `SSL/TLS certificate issue detected. This matches INC-013 where a certificate expired causing 100% HTTPS failure. Immediate action: renew the certificate and deploy it immediately. Do not wait for auto-renewal — it may have already failed.`;
      likelyCauses = [
        'SSL certificate expired (check expiry date immediately)',
        'Certificate auto-renewal failed silently (ACME challenge failure)',
        'Wrong certificate deployed to wrong domain',
        'Certificate chain incomplete (missing intermediate certificate)',
      ];
      recommendedSteps = [
        'IMMEDIATE: Check certificate expiry: echo | openssl s_client -connect <domain>:443 2>/dev/null | openssl x509 -noout -dates',
        'If expired: run emergency renewal with Let\'s Encrypt: certbot renew --force-renewal',
        'Deploy new certificate to load balancer / ingress immediately',
        'Verify auto-renewal configuration and fix any ACME challenge issues',
        'Add certificate expiry monitoring with 30/14/7/1 day alerts',
      ];
      recommendedActions = [
        'echo | openssl s_client -connect <domain>:443 2>/dev/null | openssl x509 -noout -dates',
        'certbot renew --force-renewal --cert-name <domain>',
        'kubectl create secret tls tls-secret --cert=cert.pem --key=key.pem -n production --dry-run=client -o yaml | kubectl apply -f -',
      ];
      warningsFromHistory = [
        'WARNING (from INC-013): Do NOT wait for auto-renewal to fix itself — it likely failed for a reason (ACME config change).',
        'WARNING (from INC-013): Self-signed certificates will cause browser warnings — users will see ERR_CERT_AUTHORITY_INVALID instead.',
      ];
    } else {
      // Generic response using available memories
      confidence = 65;
      summary = `Incident analysis in progress for ${incident.title} affecting ${incident.service}. ${memories.length} relevant historical incidents retrieved from memory. Analyzing patterns to determine most likely root cause and remediation path.`;
      likelyCauses = [
        `Resource exhaustion in ${incident.service} (CPU, memory, or connection limits)`,
        'Configuration error or drift from last successful deployment',
        'Upstream dependency failure causing cascade to this service',
        'Traffic spike exceeding current capacity limits',
      ];
      recommendedSteps = [
        `IMMEDIATE: Check ${incident.service} pod health and recent restart count`,
        'Review error logs for the specific error pattern to narrow root cause',
        'Check for recent deployments or configuration changes in the last 2 hours',
        'Verify all upstream dependencies are healthy',
        'Check resource utilization (CPU, memory, connections) for anomalies',
      ];
      recommendedActions = [
        `kubectl describe pod -l app=${incident.service} to check resource pressure and events`,
        `kubectl logs -l app=${incident.service} --tail=100 --since=5m to see recent errors`,
        'kubectl top pods --sort-by=memory to identify memory pressure',
      ];
      warningsFromHistory = memories.length > 0
        ? memories
            .filter(m => m.failedApproaches)
            .slice(0, 2)
            .map(m => `WARNING (from ${m.id}): Previously failed approaches: ${m.failedApproaches.substring(0, 150)}`)
        : ['Review historical incidents before taking action to avoid known failed approaches.'];
    }

    // Build historical matches from memories
    const historicalMatches = memories.map(m => ({
      incidentId: m.id,
      similarity: `${(m.similarity * 100).toFixed(0)}%`,
      relevance: `${m.title} — Root cause: ${m.rootCause.substring(0, 100)}`,
    }));

    const memoryExplanation =
      memories.length > 0
        ? `Analyzed ${memories.length} historical incidents from Hindsight memory. Most relevant: ${memories[0]?.title} (${(memories[0]?.similarity * 100).toFixed(0)}% match). Historical patterns informed root cause analysis and warnings about failed approaches.`
        : 'No directly matching historical incidents found. Analysis based on incident symptoms and error patterns only.';

    return {
      summary,
      likelyCauses,
      historicalMatches,
      recommendedSteps,
      recommendedActions,
      warningsFromHistory,
      confidence,
      memoryExplanation,
      rawMemoriesUsed: memories.length,
    };
  }

  private buildFallbackResponse(memories: MemoryResult[]): AgentResponse {
    return {
      summary: 'AI analysis completed. Please review the recommended steps and historical matches below.',
      likelyCauses: ['Could not parse structured AI response. Review logs for details.'],
      historicalMatches: memories.map(m => ({
        incidentId: m.id,
        similarity: `${(m.similarity * 100).toFixed(0)}%`,
        relevance: m.title,
      })),
      recommendedSteps: ['Review historical incidents for patterns', 'Check service logs', 'Verify recent deployments'],
      recommendedActions: ['kubectl describe pod <pod-name>', 'kubectl logs <pod-name> --tail=100'],
      warningsFromHistory: ['Review failed approaches in historical incidents before acting.'],
      confidence: 50,
      memoryExplanation: `Used ${memories.length} historical incidents from memory.`,
      rawMemoriesUsed: memories.length,
    };
  }
}
