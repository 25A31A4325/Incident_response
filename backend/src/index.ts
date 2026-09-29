import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// ─── DB & routes (import after dotenv) ───────────────────────────
import db, { initDB } from './db/database';
import incidentsRouter from './routes/incidents';
import memoryRouter   from './routes/memory';
import analyticsRouter from './routes/analytics';
import authRouter     from './routes/auth';
import demoRouter     from './routes/demo';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ─── Security middleware ──────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// ─── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const { HindsightMemoryService } = require('./hindsight/memoryService');
  const mem = new HindsightMemoryService();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: mem.isLive() ? 'live' : 'demo',
    hindsight: mem.isLive() ? 'connected' : 'demo-mode',
    ai: process.env.GEMINI_API_KEY ? 'gemini-live' : 'demo-mode',
    version: '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/incidents', incidentsRouter);
app.use('/api/memory',    memoryRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth',      authRouter);
app.use('/api/demo',      demoRouter);

// ─── 404 handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start ────────────────────────────────────────────────────────
async function start() {
  try {
    // Initialize database
    initDB();
    console.log('[DB] Database initialized');

    app.listen(PORT, () => {
      console.log(`\n╔══════════════════════════════════════╗`);
      console.log(`║   IncidentMind AI Backend            ║`);
      console.log(`║   http://localhost:${PORT}               ║`);
      console.log(`╚══════════════════════════════════════╝`);
      console.log(`\n  API Base:   http://localhost:${PORT}/api`);
      console.log(`  Health:     http://localhost:${PORT}/api/health`);
      console.log(`  Hindsight:  ${process.env.VECTORIZE_API_KEY ? '✓ Live' : '○ Demo mode'}`);
      console.log(`  AI (Gemini):${process.env.GEMINI_API_KEY ? ' ✓ Live' : ' ○ Demo mode'}\n`);
    });
  } catch (err: any) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────
process.on('SIGINT',  () => { console.log('\n[Server] Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { console.log('\n[Server] Shutting down...'); process.exit(0); });

start();
