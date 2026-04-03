import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

router.use(authMiddleware);

// Get available balance
router.get('/', (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT available_balance FROM users WHERE id = ?').get(req.userId!) as any;
  const fixedExpenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM fixed_expenses WHERE user_id = ?').get(req.userId!) as any;

  res.json({
    available_balance: user?.available_balance || 0,
    fixed_expenses_total: fixedExpenses.total,
  });
});

// Update available balance
router.put('/', (req: AuthRequest, res: Response) => {
  const { amount } = req.body;

  if (amount === undefined) {
    res.status(400).json({ error: 'Monto requerido' });
    return;
  }

  db.prepare('UPDATE users SET available_balance = ? WHERE id = ?').run(amount, req.userId!);

  const user = db.prepare('SELECT available_balance FROM users WHERE id = ?').get(req.userId!) as any;
  res.json({ available_balance: user.available_balance });
});

// Add to available balance
router.post('/add', (req: AuthRequest, res: Response) => {
  const { amount } = req.body;

  if (!amount) {
    res.status(400).json({ error: 'Monto requerido' });
    return;
  }

  const user = db.prepare('SELECT available_balance FROM users WHERE id = ?').get(req.userId!) as any;
  const newBalance = (user?.available_balance || 0) + amount;

  db.prepare('UPDATE users SET available_balance = ? WHERE id = ?').run(newBalance, req.userId!);
  res.json({ available_balance: newBalance });
});

export default router;
