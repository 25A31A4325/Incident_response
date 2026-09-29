export interface DemoIncident {
  id: string;
  title: string;
  service: string;
  environment: string;
  severity: string;
  description: string;
  errorMessage?: string;
  logs?: string;
  status: string;
  rootCause: string;
  resolution: string;
  resolutionTimeMinutes: number;
  failedApproaches: string;
  outcome: string;
  engineerFeedback?: string;
  createdAt: string;
  resolvedAt?: string;
  hindsightStored: boolean;
}

export function initializeSchema(db: any): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'engineer',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      service TEXT NOT NULL,
      environment TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      error_message TEXT,
      logs TEXT,
      status TEXT DEFAULT 'open',
      root_cause TEXT,
      resolution TEXT,
      resolution_time_minutes INTEGER,
      failed_approaches TEXT,
      engineer_feedback TEXT,
      hindsight_stored INTEGER DEFAULT 0,
      ai_recommendation TEXT,
      memories_used TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT,
      created_by TEXT
    );

    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      incident_id TEXT,
      memory_type TEXT,
      content TEXT,
      hindsight_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export function seedDemoData(db: any): void {
  const { DEMO_INCIDENTS } = require('../demo/demoData');

  const count = db.prepare('SELECT COUNT(*) as cnt FROM incidents').get() as { cnt: number };
  if (count.cnt > 0) return;

  console.log('[DB] Seeding demo incidents...');

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

  const insertMany = db.transaction((incidents: DemoIncident[]) => {
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
  console.log(`[DB] Seeded ${DEMO_INCIDENTS.length} demo incidents`);
}
