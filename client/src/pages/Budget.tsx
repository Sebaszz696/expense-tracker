import { useState, useEffect } from 'react';
import { api } from '../context/api';
import { Category, Summary } from '../types';
import { Save } from 'lucide-react';

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Budget() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [budgets, setBudgets] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    api.getCategories().then(cats => {
      setCategories(cats);
      const b: Record<number, string> = {};
      cats.forEach(c => { b[c.id] = String(c.budget_limit || 0); });
      setBudgets(b);
    });
    api.getSummary(month, year).then(setSummary);
  }, []);

  const handleSave = async (id: number) => {
    setSaving(id);
    await api.updateCategory(id, { budget_limit: Number(budgets[id]?.replace(/\D/g, '') || 0) });
    const cats = await api.getCategories();
    setCategories(cats);
    setSaving(null);
  };

  const formatInputCOP = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('es-CO') : '';
  };

  const totalBudget = categories.reduce((s, c) => s + (c.budget_limit || 0), 0);
  const totalSpent = summary?.totalExpenses || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Presupuesto</h2>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Presupuesto Total</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{formatCOP(totalBudget)}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Gastado Este Mes</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCOP(totalSpent)}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Disponible</p>
          <p className={`text-xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCOP(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="space-y-3">
        {categories.map(cat => {
          const spent = summary?.byCategory.find(c => c.id === cat.id)?.total || 0;
          const limit = cat.budget_limit || 0;
          const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver = spent > limit && limit > 0;

          return (
            <div key={cat.id} className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</p>
                    <p className="text-xs text-gray-400 dark:text-dark-500">
                      Gastado: {formatCOP(spent)}
                      {limit > 0 && ` / ${formatCOP(limit)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="text"
                      value={formatInputCOP(budgets[cat.id] || '0')}
                      onChange={e => setBudgets({ ...budgets, [cat.id]: e.target.value.replace(/\D/g, '') })}
                      className="w-36 pl-7 pr-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-right"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(cat.id)}
                    disabled={saving === cat.id}
                    className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {limit > 0 && (
                <div className="h-2.5 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
