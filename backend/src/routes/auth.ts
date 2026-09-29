import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticateToken, generateToken, AuthRequest } from '../auth/middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing user
    const existing = db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .get(username, email);
    if (existing) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'engineer';

    db.prepare(
      `INSERT INTO users (id, username, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, username, email, passwordHash, userRole);

    const user = { id, username, email, role: userRole };
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: { id, username, email, role: userRole },
    });
  } catch (err: any) {
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const user = db
      .prepare('SELECT id, username, email, password_hash, role FROM users WHERE username = ? OR email = ?')
      .get(username, username) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokenUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenUser);

    return res.json({
      token,
      user: tokenUser,
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = db
      .prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?')
      .get(req.user!.id) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (err: any) {
    console.error('[Auth] Me error:', err.message);
    return res.status(500).json({ error: 'Failed to get user info' });
  }
});

// POST /api/auth/demo-login — instant demo access without registration
router.post('/demo-login', (req, res: Response) => {
  const demoUser = {
    id: 'demo-user-001',
    username: 'demo_engineer',
    email: 'demo@incidentmind.ai',
    role: 'engineer',
  };
  const token = generateToken(demoUser);
  return res.json({ token, user: demoUser, isDemo: true });
});

export default router;
