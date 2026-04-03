import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  let query = 'SELECT * FROM income_records WHERE user_id = ?';
  const params: any[] = [req.userId!];

  if (month && year) {
    query += ' AND strftime("%m", date) = ? AND strftime("%Y", date) = ?';
    params.push(String(month).padStart(2, '0'), String(year));
  }

  query += ' ORDER BY date DESC';
  const records = db.prepare(query).all(...params);
  res.json(records);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const { description, amount, date, is_recurring } = req.body;

  if (!description || !amount || !date) {
    res.status(400).json({ error: 'Descripción, monto y fecha son requeridos' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO income_records (user_id, description, amount, date, is_recurring) VALUES (?, ?, ?, ?, ?)'
  ).run(req.userId!, description, amount, date, is_recurring ? 1 : 0);

  const record = db.prepare('SELECT * FROM income_records WHERE id = ?').get(result.lastInsertRowid);
  res.json(record);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM income_records WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true });
});

export default router;
