import { Router, Response } from 'express';
import db from '../db/database';
import { DEMO_INCIDENTS } from '../demo/demoData';
import { HindsightMemoryService } from '../hindsight/memoryService';
import { AIAgentService } from '../ai/agentService';
import { RecallService } from '../hindsight/recallService';
import { optionalAuth, AuthRequest } from '../auth/middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const memoryService = new HindsightMemoryService();
const recallService = new RecallService(memoryService);
const aiAgent = new AIAgentService();

// ─────────────────────────────────────────────
// GET /api/demo/incidents — Get demo incident data
// ─────────────────────────────────────────────
router.get('/incidents', (req, res: Response) => {
  return res.json({
    incidents: DEMO_INCIDENTS,
    count: DEMO_INCIDENTS.length,
    description: 'Historical demo incidents used for Hindsight memory demonstration',
  });
});

// ─────────────────────────────────────────────
// POST /api/demo/reset — Reset DB to demo state
// ─────────────────────────────────────────────
router.post('/reset', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    console.log('[Demo] Resetting database to demo state...');

    // Clear existing data (preserve users)
    db.exec(`
      DELETE FROM memories;
      DELETE FROM incidents;
    `);

    // Re-seed demo incidents
    const insert = db.prepare(`
      INSERT OR IGNORE INTO incidents (
        id, title, service, environment, severity, description,
        error_message, logs, status, root_cause, resolution,
        resolution_time_minutes, failed_approaches, engineer_feedback,
        hindsight_stored, created_at, resolved_at
      ) VALUES (
        @id, @title, @service, @environment, @severity, @description,
        @errorMessage, @logs, @status, @rootCause, @resolution,
        @resolutionTimeMinutes, @failedApproaches, @engineerFeedback,
        @hindsightStored, @createdAt, @resolvedAt
      )
    `);

    const insertMany = db.transaction((incidents: typeof DEMO_INCIDENTS) => {
      for (const inc of incidents) {
        insert.run({
          id: inc.id,
          title: inc.title,
          service: inc.service,
          environment: inc.environment,
          severity: inc.severity,
          description: inc.description,
          errorMessage: inc.errorMessage || null,
          logs: inc.logs || null,
          status: inc.status,
          rootCause: inc.rootCause,
          resolution: inc.resolution,
          resolutionTimeMinutes: inc.resolutionTimeMinutes,
          failedApproaches: inc.failedApproaches,
          engineerFeedback: inc.engineerFeedback || null,
          hindsightStored: inc.hindsightStored ? 1 : 0,
          createdAt: inc.createdAt,
          resolvedAt: inc.resolvedAt || null,
        });
      }
    });

    insertMany(DEMO_INCIDENTS);

    console.log('[Demo] Database reset complete');

    return res.json({
      message: 'Demo database reset successfully',
      incidentsLoaded: DEMO_INCIDENTS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Demo] Reset error:', err.message);
    return res.status(500).json({ error: 'Failed to reset demo data', details: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/demo/run-sequence — Run judge demo
// Simulates a full incident lifecycle for demo/judging purposes
// ─────────────────────────────────────────────
router.post('/run-sequence', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { scenario = 'payment-latency' } = req.body;

    console.log(`[Demo] Running demo sequence: ${scenario}`);

    // Define demo scenarios
    const scenarios: Record<string, any> = {
      'payment-latency': {
        title: 'Payment API Critical Latency Spike',
        service: 'payment-service',
        environment: 'production',
        severity: 'critical',
        description: 'Payment API response times have spiked to 9500ms (p99), up from baseline of 180ms. Payment success rate dropped from 99.9% to 31%. Multiple checkout failures reported by users. Revenue impact: ~$15K/minute.',
        errorMessage: 'TimeoutError: DB connection pool exhausted (50/50). 89 requests queued. Connection wait > 30000ms.',
        logs: '[15:42:01] ERROR Pool exhausted: 50/50 active\n[15:42:01] ERROR 89 requests waiting for DB connection\n[15:42:15] CRITICAL p99 latency: 9534ms\n[15:42:16] CRITICAL Payment success rate: 31%\n[15:42:30] ERROR SlowQuery: 6800ms on payments table\n[15:42:45] ERROR checkout-service: upstream timeout'
      },
      'auth-outage': {
        title: 'Auth Service Complete Outage After Secret Rotation',
        service: 'auth-service',
        environment: 'production',
        severity: 'critical',
        description: 'Complete authentication failure after emergency JWT secret rotation. All 47,000 active users logged out simultaneously. Login attempts returning 401 across all endpoints. Revenue-critical operations blocked.',
        errorMessage: 'JsonWebTokenError: invalid signature. All tokens invalidated after secret rotation without grace period.',
        logs: '[09:15:00] INFO JWT secret rotation initiated\n[09:15:02] ERROR JsonWebTokenError: invalid signature\n[09:15:02] ERROR Auth failure rate: 100%\n[09:15:10] CRITICAL 47,000 concurrent users logged out\n[09:15:15] ERROR New logins also failing: service misconfigured'
      },
      'memory-leak': {
        title: 'Payment Service Memory Leak OOMKill',
        service: 'payment-service',
        environment: 'production',
        severity: 'high',
        description: 'Payment service pods being OOMKilled repeatedly. Memory growing at 45MB/hour. After 10 hours, memory hit limit and pod crashed. Payment processing interrupted during restart. Heap dumps show EventEmitter leak.',
        errorMessage: 'OOMKilled: Container payment-service exceeded memory limit 512Mi. Heap: 7.8GB allocated, 7.5GB retained. EventEmitter: 52,847 listeners detected.',
        logs: '[00:00:00] INFO Memory: 210MB\n[05:00:00] WARN Memory: 435MB\n[09:00:00] ERROR Memory: 498MB (limit: 512MB)\n[10:08:00] ERROR OOMKilled: limit exceeded\n[10:08:01] INFO Pod restarting (interrupt: 8 seconds)\n[10:10:00] WARN Memory already growing again: 215MB'
      },
      'redis-failure': {
        title: 'Redis Cache Failure - Full Cache Miss Storm',
        service: 'cache-service',
        environment: 'production',
        severity: 'high',
        description: 'Redis cache hit rate dropped from 94% to 0% following OOM eviction. Database CPU spiked to 99%. API response times 10x slower. All services experiencing degraded performance due to cold cache.',
        errorMessage: 'OOMKilled: Redis container exceeded memory limit 2Gi. maxmemory-policy allkeys-lru evicted ALL 2.4M keys including sessions.',
        logs: '[11:45:00] WARN Redis memory: 95%\n[11:45:31] ERROR OOM: Evicting ALL keys (allkeys-lru)\n[11:45:31] CRITICAL Cache hit rate: 0% (was 94%)\n[11:45:32] CRITICAL DB CPU: 99%\n[11:46:00] ERROR Redis restarting - cold cache\n[11:46:15] ERROR 10x latency on all API calls'
      }
    };

    const scenarioData = scenarios[scenario] || scenarios['payment-latency'];

    // Step 1: Create the incident
    const incidentId = `DEMO-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO incidents (
        id, title, service, environment, severity, description,
        error_message, logs, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)`
    ).run(
      incidentId,
      scenarioData.title,
      scenarioData.service,
      scenarioData.environment,
      scenarioData.severity,
      scenarioData.description,
      scenarioData.errorMessage,
      scenarioData.logs,
      now
    );

    // Step 2: Recall memories
    const memories = await recallService.recallForIncident(
      scenarioData.title,
      scenarioData.description,
      scenarioData.service,
      scenarioData.errorMessage
    );

    // Step 3: Run AI analysis
    const analysis = await aiAgent.investigateIncident(
      {
        id: incidentId,
        title: scenarioData.title,
        service: scenarioData.service,
        environment: scenarioData.environment,
        severity: scenarioData.severity,
        description: scenarioData.description,
        errorMessage: scenarioData.errorMessage,
        logs: scenarioData.logs,
      },
      memories
    );

    // Save to DB
    db.prepare(
      `UPDATE incidents SET ai_recommendation = ?, memories_used = ? WHERE id = ?`
    ).run(
      JSON.stringify(analysis),
      JSON.stringify(memories.map(m => m.id)),
      incidentId
    );

    return res.json({
      success: true,
      scenario,
      incidentId,
      incident: {
        id: incidentId,
        title: scenarioData.title,
        service: scenarioData.service,
        severity: scenarioData.severity,
        status: 'open',
        createdAt: now,
      },
      memoriesRecalled: memories.length,
      memories: memories.slice(0, 3),
      analysis,
      hindsightMode: memoryService.isLive() ? 'live' : 'demo',
      aiMode: process.env.GEMINI_API_KEY ? 'live' : 'demo',
      message: `Demo sequence complete. Incident ${incidentId} created and analyzed using ${memories.length} historical memories from Hindsight.`,
    });
  } catch (err: any) {
    console.error('[Demo] Sequence error:', err.message);
    return res.status(500).json({ error: 'Demo sequence failed', details: err.message });
  }
});

export default router;
