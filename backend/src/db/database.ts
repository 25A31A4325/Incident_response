import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeSchema, seedDemoData } from './schema';

// ─── Ensure data directory exists ────────────────────────────────
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'incidentmind.db');

// ─── Create / open database ───────────────────────────────────────
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development'
    ? (msg) => console.log('[SQLite]', msg)
    : undefined,
});

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Initialize schema + seed ─────────────────────────────────────
export function initDB(): void {
  initializeSchema(db);
  seedDemoData(db);
  console.log(`[DB] SQLite database ready at: ${DB_PATH}`);
}

export default db;
