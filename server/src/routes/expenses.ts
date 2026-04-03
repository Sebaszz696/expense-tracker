import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  const { month, year, category_id } = req.query;
  let query = 'SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.user_id = ?';
  const params: any[] = [req.userId!];

  if (month && year) {
    query += " AND strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?";
    params.push(String(month).padStart(2, '0'), String(year));
  }

  if (category_id) {
    query += ' AND e.category_id = ?';
    params.push(Number(category_id));
  }

  query += ' ORDER BY e.date DESC, e.created_at DESC';

  const expenses = db.prepare(query).all(...params);
  res.json(expenses);
});

router.get('/summary', (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  const currentMonth = month || String(new Date().getMonth() + 1);
  const currentYear = year || String(new Date().getFullYear());
  const paddedMonth = String(currentMonth).padStart(2, '0');

  const totalExpenses = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses
     WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?`
  ).get(req.userId!, paddedMonth, String(currentYear)) as any;

  const byCategory = db.prepare(
    `SELECT c.id, c.name, c.icon, c.color, c.budget_limit, COALESCE(SUM(e.amount), 0) as total
     FROM categories c
     LEFT JOIN expenses e ON e.category_id = c.id
       AND strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?
     WHERE c.user_id = ?
     GROUP BY c.id
     ORDER BY total DESC`
  ).all(paddedMonth, String(currentYear), req.userId!);

  const dailyExpenses = db.prepare(
    `SELECT date, SUM(amount) as total FROM expenses
     WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
     GROUP BY date ORDER BY date`
  ).all(req.userId!, paddedMonth, String(currentYear));

  const user = db.prepare('SELECT monthly_income FROM users WHERE id = ?').get(req.userId!) as any;

  const totalIncome = db.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM income_records
     WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?`
  ).get(req.userId!, paddedMonth, String(currentYear)) as any;

  res.json({
    totalExpenses: totalExpenses.total,
    totalIncome: totalIncome.total + (user?.monthly_income || 0),
    monthlyIncome: user?.monthly_income || 0,
    additionalIncome: totalIncome.total,
    byCategory,
    dailyExpenses,
    balance: (totalIncome.total + (user?.monthly_income || 0)) - totalExpenses.total,
  });
});

router.post('/', (req: AuthRequest, res: Response) => {
  const { description, amount, category_id, date } = req.body;

  if (!description || !amount || !date) {
    res.status(400).json({ error: 'Descripción, monto y fecha son requeridos' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO expenses (user_id, category_id, description, amount, date) VALUES (?, ?, ?, ?, ?)'
  ).run(req.userId!, category_id || null, description, amount, date);

  const expense = db.prepare(
    `SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = ?`
  ).get(result.lastInsertRowid);

  res.json(expense);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const { description, amount, category_id, date } = req.body;

  db.prepare(
    `UPDATE expenses SET description = COALESCE(?, description), amount = COALESCE(?, amount),
     category_id = COALESCE(?, category_id), date = COALESCE(?, date) WHERE id = ? AND user_id = ?`
  ).run(description, amount, category_id, date, req.params.id, req.userId!);

  const expense = db.prepare(
    `SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = ?`
  ).get(req.params.id);

  res.json(expense);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(req.params.id, req.userId!);
  res.json({ success: true });
});

export default router;
