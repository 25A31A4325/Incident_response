import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { AIAgentService } from '../ai/agentService';
import { HindsightMemoryService } from '../hindsight/memoryService';
import { RecallService } from '../hindsight/recallService';
import { StoreService } from '../hindsight/storeService';
import { optionalAuth, AuthRequest, authenticateToken } from '../auth/middleware';

const router = Router();

const memoryService = new HindsightMemoryService();
const recallService = new RecallService(memoryService);
const storeService = new StoreService(memoryService);
const aiAgent = new AIAgentService();

// ─────────────────────────────────────────────
// POST /api/incidents — Create a new incident
// ─────────────────────────────────────────────
router.post('/', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      service,
      environment,
      severity,
      description,
      errorMessage,
      logs,
    } = req.body;

    if (!title || !service || !environment || !severity || !description) {
      return res.status(400).json({
        error: 'title, service, environment, severity, and description are required',
      });
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: `severity must be one of: ${validSeverities.join(', ')}` });
    }

    const id = `INC-${Date.now().toString().slice(-6)}-${uuidv4().split('-')[0].toUpperCase()}`;
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO incidents (
        id, title, service, environment, severity, description,
        error_message, logs, status, created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`
    ).run(
      id, title, service, environment, severity, description,
      errorMessage || null, logs || null, now,
      req.user?.id || null
    );

    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id) as any;

    return res.status(201).json({
      id,
      message: 'Incident created successfully',
      incident: mapIncident(incident),
    });
  } catch (err: any) {
    console.error('[Incidents] Create error:', err.message);
    return res.status(500).json({ error: 'Failed to create incident' });
  }
});

// ─────────────────────────────────────────────
// GET /api/incidents — List incidents
// ─────────────────────────────────────────────
router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      severity,
      service,
      sort = 'created_at',
      order = 'desc',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR service LIKE ? OR id LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (severity) {
      conditions.push('severity = ?');
      params.push(severity);
    }
    if (service) {
      conditions.push('service = ?');
      params.push(service);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const validSortFields = ['created_at', 'severity', 'service', 'status', 'resolved_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const total = (
      db.prepare(`SELECT COUNT(*) as cnt FROM incidents ${where}`).get(...params) as any
    ).cnt;

    const rows = db
      .prepare(`SELECT * FROM incidents ${where} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`)
      .all(...params, limitNum, offset) as any[];

    return res.json({
      incidents: rows.map(mapIncident),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error('[Incidents] List error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// ─────────────────────────────────────────────
// GET /api/incidents/:id — Get incident details
// ─────────────────────────────────────────────
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id) as any;
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    return res.json(mapIncident(incident));
  } catch (err: any) {
    console.error('[Incidents] Get error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// ─────────────────────────────────────────────
// POST /api/incidents/:id/investigate — Run AI investigation
// ─────────────────────────────────────────────
router.post('/:id/investigate', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id) as any;
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    console.log(`[Incidents] Investigating ${incident.id}: ${incident.title}`);

    // Recall relevant memories from Hindsight
    const memories = await recallService.recallForIncident(
      incident.title,
      incident.description,
      incident.service,
      incident.error_message
    );

    console.log(`[Incidents] Found ${memories.length} relevant memories`);

    // Run AI investigation
    const agentResponse = await aiAgent.investigateIncident(
      {
        id: incident.id,
        title: incident.title,
        service: incident.service,
        environment: incident.environment,
        severity: incident.severity,
        description: incident.description,
        errorMessage: incident.error_message,
        logs: incident.logs,
      },
      memories
    );

    // Save AI recommendation to the incident
    db.prepare(
      `UPDATE incidents SET ai_recommendation = ?, memories_used = ? WHERE id = ?`
    ).run(
      JSON.stringify(agentResponse),
      JSON.stringify(memories.map(m => m.id)),
      incident.id
    );

    return res.json({
      incidentId: incident.id,
      analysis: agentResponse,
      memoriesRecalled: memories,
      hindsightMode: memoryService.isLive() ? 'live' : 'demo',
      aiMode: process.env.GEMINI_API_KEY ? 'live' : 'demo',
    });
  } catch (err: any) {
    console.error('[Incidents] Investigate error:', err.message);
    return res.status(500).json({ error: 'Investigation failed', details: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/incidents/:id/resolve — Resolve and store to Hindsight
// ─────────────────────────────────────────────
router.post('/:id/resolve', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id) as any;
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const {
      rootCause,
      resolution,
      resolutionTimeMinutes,
      failedApproaches,
      engineerFeedback,
      outcome,
    } = req.body;

    if (!rootCause || !resolution) {
      return res.status(400).json({ error: 'rootCause and resolution are required' });
    }

    const resolvedAt = new Date().toISOString();

    // Update incident in DB
    db.prepare(
      `UPDATE incidents SET
        status = 'resolved',
        root_cause = ?,
        resolution = ?,
        resolution_time_minutes = ?,
        failed_approaches = ?,
        engineer_feedback = ?,
        resolved_at = ?
       WHERE id = ?`
    ).run(
      rootCause,
      resolution,
      resolutionTimeMinutes || null,
      failedApproaches || null,
      engineerFeedback || null,
      resolvedAt,
      incident.id
    );

    // Store to Hindsight
    const storeResult = await storeService.storeResolution({
      incidentId: incident.id,
      title: incident.title,
      service: incident.service,
      severity: incident.severity,
      description: incident.description,
      rootCause,
      resolution,
      failedApproaches: failedApproaches || '',
      resolutionTimeMinutes: resolutionTimeMinutes || 0,
      outcome: outcome || resolution,
      engineerFeedback: engineerFeedback || '',
      createdAt: incident.created_at,
    });

    const updatedIncident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(incident.id) as any;

    return res.json({
      message: 'Incident resolved and stored to Hindsight memory',
      incident: mapIncident(updatedIncident),
      hindsight: storeResult,
    });
  } catch (err: any) {
    console.error('[Incidents] Resolve error:', err.message);
    return res.status(500).json({ error: 'Failed to resolve incident', details: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/incidents/:id — Delete incident
// ─────────────────────────────────────────────
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id) as any;
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    db.prepare('DELETE FROM incidents WHERE id = ?').run(req.params.id);
    db.prepare('DELETE FROM memories WHERE incident_id = ?').run(req.params.id);

    return res.json({ message: 'Incident deleted', id: req.params.id });
  } catch (err: any) {
    console.error('[Incidents] Delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete incident' });
  }
});

// ─────────────────────────────────────────────
// Helper: map DB row to API response shape
// ─────────────────────────────────────────────
function mapIncident(row: any) {
  return {
    id: row.id,
    title: row.title,
    service: row.service,
    environment: row.environment,
    severity: row.severity,
    description: row.description,
    errorMessage: row.error_message,
    logs: row.logs,
    status: row.status,
    rootCause: row.root_cause,
    resolution: row.resolution,
    resolutionTimeMinutes: row.resolution_time_minutes,
    failedApproaches: row.failed_approaches,
    engineerFeedback: row.engineer_feedback,
    hindsightStored: row.hindsight_stored === 1,
    aiRecommendation: row.ai_recommendation ? JSON.parse(row.ai_recommendation) : null,
    memoriesUsed: row.memories_used ? JSON.parse(row.memories_used) : [],
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    createdBy: row.created_by,
  };
}

export default router;
