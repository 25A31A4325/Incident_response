import { Router, Response } from 'express';
import db from '../db/database';
import { HindsightMemoryService } from '../hindsight/memoryService';
import { RecallService } from '../hindsight/recallService';
import { optionalAuth, authenticateToken, AuthRequest } from '../auth/middleware';

const router = Router();
const memoryService = new HindsightMemoryService();
const recallService = new RecallService(memoryService);

// ─────────────────────────────────────────────
// GET /api/memory — List all stored memories
// ─────────────────────────────────────────────
router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const rows = db
      .prepare(
        `SELECT m.*, i.title as incident_title, i.service, i.severity
         FROM memories m
         LEFT JOIN incidents i ON m.incident_id = i.id
         ORDER BY m.created_at DESC
         LIMIT 100`
      )
      .all() as any[];

    const resolvedCount = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE status = ?').get('resolved') as any
    ).cnt;

    return res.json({
      memories: rows.map(r => ({
        id: r.id,
        incidentId: r.incident_id,
        incidentTitle: r.incident_title,
        service: r.service,
        severity: r.severity,
        memoryType: r.memory_type,
        content: r.content ? JSON.parse(r.content) : null,
        hindsightId: r.hindsight_id,
        createdAt: r.created_at,
      })),
      hindsightMode: memoryService.isLive() ? 'live' : 'demo',
      totalResolved: resolvedCount,
    });
  } catch (err: any) {
    console.error('[Memory] List error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// ─────────────────────────────────────────────
// GET /api/memory/stats — Memory statistics
// ─────────────────────────────────────────────
router.get('/stats', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const totalIncidents = (db.prepare('SELECT COUNT(*) as cnt FROM incidents').get() as any).cnt;
    const resolvedIncidents = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE status = ?').get('resolved') as any
    ).cnt;
    const storedInHindsight = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE hindsight_stored = 1').get() as any
    ).cnt;
    const totalMemories = (db.prepare('SELECT COUNT(*) as cnt FROM memories').get() as any).cnt;

    const serviceStats = db
      .prepare(
        `SELECT service, COUNT(*) as count, 
                AVG(resolution_time_minutes) as avg_resolution_time
         FROM incidents WHERE status = 'resolved'
         GROUP BY service ORDER BY count DESC`
      )
      .all() as any[];

    const avgResolutionTime = (
      db
        .prepare(
          'SELECT AVG(resolution_time_minutes) as avg FROM incidents WHERE status = ? AND resolution_time_minutes IS NOT NULL'
        )
        .get('resolved') as any
    )?.avg;

    return res.json({
      totalIncidents,
      resolvedIncidents,
      openIncidents: totalIncidents - resolvedIncidents,
      storedInHindsight,
      totalMemories,
      hindsightMode: memoryService.isLive() ? 'live' : 'demo',
      avgResolutionTimeMinutes: avgResolutionTime
        ? Math.round(avgResolutionTime * 10) / 10
        : null,
      serviceBreakdown: serviceStats.map(s => ({
        service: s.service,
        incidentCount: s.count,
        avgResolutionMinutes: s.avg_resolution_time
          ? Math.round(s.avg_resolution_time * 10) / 10
          : null,
      })),
    });
  } catch (err: any) {
    console.error('[Memory] Stats error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch memory stats' });
  }
});

// ─────────────────────────────────────────────
// GET /api/memory/patterns — Learned patterns
// ─────────────────────────────────────────────
router.get('/patterns', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    // Top recurring root cause patterns
    const rootCausePatterns = db
      .prepare(
        `SELECT root_cause, COUNT(*) as count, 
                AVG(resolution_time_minutes) as avg_time,
                GROUP_CONCAT(id, ',') as incident_ids
         FROM incidents 
         WHERE status = 'resolved' AND root_cause IS NOT NULL
         GROUP BY root_cause 
         ORDER BY count DESC 
         LIMIT 10`
      )
      .all() as any[];

    // Services with most incidents
    const servicePatterns = db
      .prepare(
        `SELECT service, 
                COUNT(*) as total_incidents,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                AVG(CASE WHEN resolution_time_minutes IS NOT NULL THEN resolution_time_minutes END) as avg_resolution_time,
                COUNT(DISTINCT severity) as severity_count
         FROM incidents 
         GROUP BY service 
         ORDER BY total_incidents DESC`
      )
      .all() as any[];

    // Failed approaches to avoid
    const failedApproaches = db
      .prepare(
        `SELECT service, failed_approaches, COUNT(*) as count
         FROM incidents
         WHERE status = 'resolved' AND failed_approaches IS NOT NULL AND failed_approaches != ''
         GROUP BY service, failed_approaches
         ORDER BY count DESC
         LIMIT 10`
      )
      .all() as any[];

    // Severity distribution
    const severityDist = db
      .prepare(
        `SELECT severity, COUNT(*) as count
         FROM incidents GROUP BY severity`
      )
      .all() as any[];

    return res.json({
      rootCausePatterns: rootCausePatterns.map(r => ({
        rootCause: r.root_cause?.substring(0, 150),
        occurrences: r.count,
        avgResolutionMinutes: r.avg_time ? Math.round(r.avg_time) : null,
        incidentIds: r.incident_ids?.split(',') || [],
      })),
      servicePatterns: servicePatterns.map(s => ({
        service: s.service,
        totalIncidents: s.total_incidents,
        resolved: s.resolved,
        avgResolutionMinutes: s.avg_resolution_time ? Math.round(s.avg_resolution_time) : null,
      })),
      failedApproachesToAvoid: failedApproaches.map(f => ({
        service: f.service,
        failedApproach: f.failed_approaches?.substring(0, 200),
        seenCount: f.count,
      })),
      severityDistribution: severityDist.map(s => ({
        severity: s.severity,
        count: s.count,
      })),
    });
  } catch (err: any) {
    console.error('[Memory] Patterns error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

// ─────────────────────────────────────────────
// POST /api/memory/recall — Manual recall query
// ─────────────────────────────────────────────
router.post('/recall', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const memories = await recallService.recallByQuery(query, Math.min(10, topK));

    return res.json({
      query,
      results: memories,
      count: memories.length,
      source: memoryService.isLive() ? 'hindsight' : 'demo',
    });
  } catch (err: any) {
    console.error('[Memory] Recall error:', err.message);
    return res.status(500).json({ error: 'Recall failed', details: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/memory/:id — Delete a memory (admin)
// ─────────────────────────────────────────────
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id) as any;
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id);

    return res.json({ message: 'Memory deleted', id: req.params.id });
  } catch (err: any) {
    console.error('[Memory] Delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;
