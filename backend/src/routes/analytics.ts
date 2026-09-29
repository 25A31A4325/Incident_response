import { Router, Response } from 'express';
import db from '../db/database';
import { optionalAuth, AuthRequest } from '../auth/middleware';

const router = Router();

// ─────────────────────────────────────────────
// GET /api/analytics/overview — Summary stats
// ─────────────────────────────────────────────
router.get('/overview', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM incidents').get() as any).cnt;
    const open = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE status = ?').get('open') as any
    ).cnt;
    const resolved = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE status = ?').get('resolved') as any
    ).cnt;
    const critical = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE severity = ?').get('critical') as any
    ).cnt;
    const storedInHindsight = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE hindsight_stored = 1').get() as any
    ).cnt;

    const avgResolution = (
      db
        .prepare(
          `SELECT AVG(resolution_time_minutes) as avg 
           FROM incidents 
           WHERE status = 'resolved' AND resolution_time_minutes IS NOT NULL`
        )
        .get() as any
    )?.avg;

    const totalMemories = (db.prepare('SELECT COUNT(*) as cnt FROM memories').get() as any).cnt;

    const recentIncidents = db
      .prepare(
        `SELECT id, title, service, severity, status, created_at
         FROM incidents ORDER BY created_at DESC LIMIT 5`
      )
      .all() as any[];

    const criticalOpen = db
      .prepare(`SELECT COUNT(*) as cnt FROM incidents WHERE severity = 'critical' AND status = 'open'`)
      .get() as any;

    return res.json({
      totalIncidents: total,
      openIncidents: open,
      resolvedIncidents: resolved,
      criticalIncidents: critical,
      criticalOpenIncidents: criticalOpen.cnt,
      storedInHindsight,
      totalMemories,
      avgResolutionTimeMinutes: avgResolution ? Math.round(avgResolution * 10) / 10 : null,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      recentIncidents: recentIncidents.map(i => ({
        id: i.id,
        title: i.title,
        service: i.service,
        severity: i.severity,
        status: i.status,
        createdAt: i.created_at,
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Analytics] Overview error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// ─────────────────────────────────────────────
// GET /api/analytics/incidents-over-time — Chart data
// ─────────────────────────────────────────────
router.get('/incidents-over-time', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query as Record<string, string>;

    // Parse period
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '180d') days = 180;
    else if (period === '365d') days = 365;

    const rows = db
      .prepare(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as total,
           SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
           SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
           SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
           SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low,
           SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
         FROM incidents
         WHERE DATE(created_at) >= DATE('now', ?)
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      )
      .all(`-${days} days`) as any[];

    return res.json({
      period,
      data: rows.map(r => ({
        date: r.date,
        total: r.total,
        critical: r.critical,
        high: r.high,
        medium: r.medium,
        low: r.low,
        resolved: r.resolved,
      })),
    });
  } catch (err: any) {
    console.error('[Analytics] Incidents-over-time error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch time series data' });
  }
});

// ─────────────────────────────────────────────
// GET /api/analytics/root-causes — Root cause frequency
// ─────────────────────────────────────────────
router.get('/root-causes', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const rows = db
      .prepare(
        `SELECT 
           root_cause,
           COUNT(*) as count,
           AVG(resolution_time_minutes) as avg_resolution_time,
           GROUP_CONCAT(DISTINCT service) as affected_services,
           MAX(created_at) as last_seen
         FROM incidents
         WHERE status = 'resolved' AND root_cause IS NOT NULL AND root_cause != ''
         GROUP BY root_cause
         ORDER BY count DESC
         LIMIT 20`
      )
      .all() as any[];

    // Category-level aggregation
    const categories = {
      'Connection Pool': 0,
      'Memory/OOM': 0,
      'Configuration Error': 0,
      'Query Performance': 0,
      'External Dependency': 0,
      'Security': 0,
      'Certificate/SSL': 0,
      'Queue/Messaging': 0,
      'Other': 0,
    };

    rows.forEach(row => {
      const rc = (row.root_cause || '').toLowerCase();
      if (rc.includes('pool') || rc.includes('connection')) categories['Connection Pool']++;
      else if (rc.includes('memory') || rc.includes('oom') || rc.includes('leak')) categories['Memory/OOM']++;
      else if (rc.includes('config') || rc.includes('secret') || rc.includes('missing')) categories['Configuration Error']++;
      else if (rc.includes('query') || rc.includes('index') || rc.includes('slow')) categories['Query Performance']++;
      else if (rc.includes('external') || rc.includes('third-party') || rc.includes('stripe') || rc.includes('api')) categories['External Dependency']++;
      else if (rc.includes('security') || rc.includes('poison') || rc.includes('xss') || rc.includes('attack')) categories['Security']++;
      else if (rc.includes('ssl') || rc.includes('cert') || rc.includes('tls')) categories['Certificate/SSL']++;
      else if (rc.includes('queue') || rc.includes('kafka') || rc.includes('consumer')) categories['Queue/Messaging']++;
      else categories['Other']++;
    });

    return res.json({
      topRootCauses: rows.map(r => ({
        rootCause: r.root_cause,
        count: r.count,
        avgResolutionMinutes: r.avg_resolution_time ? Math.round(r.avg_resolution_time) : null,
        affectedServices: r.affected_services?.split(',') || [],
        lastSeen: r.last_seen,
      })),
      categories: Object.entries(categories)
        .filter(([, v]) => v > 0)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (err: any) {
    console.error('[Analytics] Root-causes error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch root cause data' });
  }
});

// ─────────────────────────────────────────────
// GET /api/analytics/resolution-times — Average by service
// ─────────────────────────────────────────────
router.get('/resolution-times', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const byService = db
      .prepare(
        `SELECT 
           service,
           COUNT(*) as incident_count,
           AVG(resolution_time_minutes) as avg_time,
           MIN(resolution_time_minutes) as min_time,
           MAX(resolution_time_minutes) as max_time
         FROM incidents
         WHERE status = 'resolved' AND resolution_time_minutes IS NOT NULL
         GROUP BY service
         ORDER BY avg_time DESC`
      )
      .all() as any[];

    const bySeverity = db
      .prepare(
        `SELECT 
           severity,
           COUNT(*) as incident_count,
           AVG(resolution_time_minutes) as avg_time,
           MIN(resolution_time_minutes) as min_time,
           MAX(resolution_time_minutes) as max_time
         FROM incidents
         WHERE status = 'resolved' AND resolution_time_minutes IS NOT NULL
         GROUP BY severity
         ORDER BY avg_time DESC`
      )
      .all() as any[];

    // Time distribution buckets
    const distribution = db
      .prepare(
        `SELECT 
           CASE 
             WHEN resolution_time_minutes < 10 THEN '0-10 min'
             WHEN resolution_time_minutes < 20 THEN '10-20 min'
             WHEN resolution_time_minutes < 30 THEN '20-30 min'
             WHEN resolution_time_minutes < 60 THEN '30-60 min'
             ELSE '60+ min'
           END as bucket,
           COUNT(*) as count
         FROM incidents
         WHERE status = 'resolved' AND resolution_time_minutes IS NOT NULL
         GROUP BY bucket
         ORDER BY MIN(resolution_time_minutes)`
      )
      .all() as any[];

    return res.json({
      byService: byService.map(r => ({
        service: r.service,
        incidentCount: r.incident_count,
        avgMinutes: Math.round(r.avg_time * 10) / 10,
        minMinutes: r.min_time,
        maxMinutes: r.max_time,
      })),
      bySeverity: bySeverity.map(r => ({
        severity: r.severity,
        incidentCount: r.incident_count,
        avgMinutes: Math.round(r.avg_time * 10) / 10,
        minMinutes: r.min_time,
        maxMinutes: r.max_time,
      })),
      distribution: distribution.map(r => ({ bucket: r.bucket, count: r.count })),
    });
  } catch (err: any) {
    console.error('[Analytics] Resolution-times error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch resolution time data' });
  }
});

// ─────────────────────────────────────────────
// GET /api/analytics/memory-growth — Memory growth over time
// ─────────────────────────────────────────────
router.get('/memory-growth', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const rows = db
      .prepare(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as new_memories,
           SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative
         FROM incidents
         WHERE status = 'resolved' AND hindsight_stored = 1
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      )
      .all() as any[];

    const recentlyStored = db
      .prepare(
        `SELECT id, title, service, severity, resolved_at
         FROM incidents
         WHERE status = 'resolved' AND hindsight_stored = 1
         ORDER BY resolved_at DESC
         LIMIT 5`
      )
      .all() as any[];

    const totalStored = (
      db.prepare('SELECT COUNT(*) as cnt FROM incidents WHERE status = ? AND hindsight_stored = 1').get('resolved') as any
    ).cnt;

    return res.json({
      growthData: rows.map(r => ({
        date: r.date,
        newMemories: r.new_memories,
        cumulative: r.cumulative,
      })),
      recentlyStored: recentlyStored.map(r => ({
        id: r.id,
        title: r.title,
        service: r.service,
        severity: r.severity,
        storedAt: r.resolved_at,
      })),
      totalMemoriesStored: totalStored,
    });
  } catch (err: any) {
    console.error('[Analytics] Memory-growth error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch memory growth data' });
  }
});

export default router;
