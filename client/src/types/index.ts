export interface User {
  id: number;
  name: string;
  email: string;
  monthlyIncome: number;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  icon: string;
  color: string;
  budget_limit: number;
}

export interface Expense {
  id: number;
  user_id: number;
  category_id: number | null;
  description: string;
  amount: number;
  date: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  created_at: string;
}

export interface IncomeRecord {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  date: string;
  is_recurring: number;
  created_at: string;
}

export interface Summary {
  totalExpenses: number;
  totalIncome: number;
  monthlyIncome: number;
  additionalIncome: number;
  byCategory: (Category & { total: number })[];
  dailyExpenses: { date: string; total: number }[];
  balance: number;
}
