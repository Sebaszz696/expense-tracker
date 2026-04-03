import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

router.use(authMiddleware);

// Get all fixed expenses
router.get('/', (req: AuthRequest, res: Response) => {
  const expenses = db.prepare(
    `SELECT fe.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM fixed_expenses fe
     LEFT JOIN categories c ON fe.category_id = c.id
     WHERE fe.user_id = ?
     ORDER BY fe.description`
  ).all(req.userId!);
  res.json(expenses);
});

// Create fixed expense
router.post('/', (req: AuthRequest, res: Response) => {
  const { description, amount, category_id } = req.body;

  if (!description || !amount) {
    res.status(400).json({ error: 'Descripción y monto son requeridos' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO fixed_expenses (user_id, description, amount, category_id) VALUES (?, ?, ?, ?)'
  ).run(req.userId!, description, amount, category_id || null);

  const expense = db.prepare(
    `SELECT fe.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM fixed_expenses fe
     LEFT JOIN categories c ON fe.category_id = c.id
     WHERE fe.id = ?`
  ).get(result.lastInsertRowid);

  res.json(expense);
});

// Update fixed expense
router.put('/:id', (req: AuthRequest, res: Response) => {
  const { description, amount, category_id } = req.body;

  db.prepare(
    `UPDATE fixed_expenses
     SET description = COALESCE(?, description),
         amount = COALESCE(?, amount),
         category_id = COALESCE(?, category_id)
     WHERE id = ? AND user_id = ?`
  ).run(description, amount, category_id, req.params.id, req.userId!);

  const expense = db.prepare(
    `SELECT fe.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM fixed_expenses fe
     LEFT JOIN categories c ON fe.category_id = c.id
     WHERE fe.id = ?`
  ).get(req.params.id);

  res.json(expense);
});

// Delete fixed expense
router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM fixed_expenses WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true });
});

export default router;
