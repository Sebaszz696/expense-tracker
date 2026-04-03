import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { generateToken, authMiddleware, AuthRequest } from '../auth';

const router = Router();

const DEFAULT_CATEGORIES = [
  { name: 'Alimentación', icon: '🍔', color: '#ef4444' },
  { name: 'Transporte', icon: '🚗', color: '#f97316' },
  { name: 'Vivienda', icon: '🏠', color: '#eab308' },
  { name: 'Servicios', icon: '💡', color: '#22c55e' },
  { name: 'Salud', icon: '🏥', color: '#06b6d4' },
  { name: 'Educación', icon: '📚', color: '#3b82f6' },
  { name: 'Entretenimiento', icon: '🎮', color: '#8b5cf6' },
  { name: 'Ropa', icon: '👕', color: '#ec4899' },
  { name: 'Tecnología', icon: '💻', color: '#6366f1' },
  { name: 'Ahorro', icon: '🏦', color: '#14b8a6' },
  { name: 'Deudas', icon: '💳', color: '#f43f5e' },
  { name: 'Otros', icon: '📦', color: '#64748b' },
];

router.post('/register', (req: AuthRequest, res: Response) => {
  const { name, email, password, monthlyIncome } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(400).json({ error: 'El email ya está registrado' });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, monthly_income) VALUES (?, ?, ?, ?)'
  ).run(name, email, hashedPassword, monthlyIncome || 0);

  const userId = result.lastInsertRowid as number;

  const insertCategory = db.prepare(
    'INSERT INTO categories (user_id, name, icon, color) VALUES (?, ?, ?, ?)'
  );
  for (const cat of DEFAULT_CATEGORIES) {
    insertCategory.run(userId, cat.name, cat.icon, cat.color);
  }

  const token = generateToken(userId);
  res.json({ token, user: { id: userId, name, email, monthlyIncome: monthlyIncome || 0 } });
});

router.post('/login', (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña son requeridos' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, monthlyIncome: user.monthly_income },
  });
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, name, email, monthly_income FROM users WHERE id = ?').get(req.userId!) as any;
  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, monthlyIncome: user.monthly_income });
});

router.put('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, monthlyIncome } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), monthly_income = COALESCE(?, monthly_income) WHERE id = ?')
    .run(name, monthlyIncome, req.userId!);
  const user = db.prepare('SELECT id, name, email, monthly_income FROM users WHERE id = ?').get(req.userId!) as any;
  res.json({ id: user.id, name: user.name, email: user.email, monthlyIncome: user.monthly_income });
});

export default router;
