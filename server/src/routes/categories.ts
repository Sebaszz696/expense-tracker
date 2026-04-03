import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  const categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name').all(req.userId!);
  res.json(categories);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const { name, icon, color, budget_limit } = req.body;

  if (!name) {
    res.status(400).json({ error: 'El nombre es requerido' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO categories (user_id, name, icon, color, budget_limit) VALUES (?, ?, ?, ?, ?)'
  ).run(req.userId!, name, icon || '📦', color || '#6366f1', budget_limit || 0);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.json(category);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const { name, icon, color, budget_limit } = req.body;

  db.prepare(
    `UPDATE categories SET name = COALESCE(?, name), icon = COALESCE(?, icon),
     color = COALESCE(?, color), budget_limit = COALESCE(?, budget_limit) WHERE id = ? AND user_id = ?`
  ).run(name, icon, color, budget_limit, req.params.id, req.userId!);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  res.json(category);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true });
});

export default router;
