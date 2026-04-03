import { useState, useEffect } from 'react';
import { api } from '../context/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, TrendingUp, DollarSign, Plus, Trash2, Edit2 } from 'lucide-react';

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Available() {
  const { user } = useAuth();
  const today = new Date();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ description: '', amount: '', category_id: '' });
  const [editBalance, setEditBalance] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  const load = async () => {
    const available = await api.getAvailable();
    setAvailableBalance(available.available_balance);
    const fixed = await api.getFixedExpenses();
    setFixedExpenses(fixed);
    const cats = await api.getCategories();
    setCategories(cats);
  };

  useEffect(() => {
    load();
  }, []);

  // Calcular próxima fecha de incremento (15 o 30)
  const getNextIncrement = () => {
    const day = today.getDate();
    if (day < 15) return new Date(today.getFullYear(), today.getMonth(), 15);
    if (day < 30) return new Date(today.getFullYear(), today.getMonth(), 30);
    return new Date(today.getFullYear(), today.getMonth() + 1, 15);
  };

  const nextIncrement = getNextIncrement();
  const daysUntilIncrement = Math.ceil((nextIncrement.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleSubmitFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      description: form.description,
      amount: Number(form.amount.replace(/\D/g, '')),
      category_id: form.category_id ? Number(form.category_id) : null,
    };

    if (editingId) {
      await api.updateFixedExpense(editingId, data);
      setEditingId(null);
    } else {
      await api.createFixedExpense(data);
    }

    setForm({ description: '', amount: '', category_id: '' });
    setShowForm(false);
    load();
  };

  const handleDeleteFixed = async (id: number) => {
    await api.deleteFixedExpense(id);
    load();
  };

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newBalance.replace(/\D/g, ''));
    await api.updateAvailable(amount);
    setAvailableBalance(amount);
    setEditBalance(false);
    setNewBalance('');
  };

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newBalance.replace(/\D/g, ''));
    const result = await api.addAvailable(amount);
    setAvailableBalance(result.available_balance);
    setNewBalance('');
  };

  const formatInputCOP = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('es-CO') : '';
  };

  const totalFixedExpenses = fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const netAvailable = availableBalance - totalFixedExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Disponible</h2>
      </div>

      {/* Available Balance Card */}
      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-8 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Tu Saldo</span>
          </div>
          <button
            onClick={() => {
              setEditBalance(true);
              setNewBalance(String(availableBalance));
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
            title="Editar saldo"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
        <p className="text-4xl font-bold mb-2">{formatCOP(availableBalance)}</p>
        {totalFixedExpenses > 0 && (
          <p className="text-sm opacity-90">
            Gastos fijos: {formatCOP(totalFixedExpenses)} → Neto: {formatCOP(netAvailable)}
          </p>
        )}
      </div>

      {/* Edit Balance Form */}
      {editBalance && (
        <form onSubmit={handleUpdateBalance} className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cambiar Saldo Disponible</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Nuevo Saldo (COP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  value={formatInputCOP(newBalance)}
                  onChange={e => setNewBalance(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setEditBalance(false)}
              className="px-4 py-2.5 text-sm text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition-all"
            >
              Actualizar
            </button>
          </div>
        </form>
      )}

      {/* Next Increment Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-cyan-500" />
            <span className="text-sm text-gray-500 dark:text-dark-400">Próximo Incremento</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {nextIncrement.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
            En {daysUntilIncrement} {daysUntilIncrement === 1 ? 'día' : 'días'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500 dark:text-dark-400">Incremento por Pago</span>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCOP(user?.monthlyIncome || 0)}
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
            Tu salario mensual
          </p>
        </div>
      </div>

      {/* Fixed Expenses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gastos Fijos</h3>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ description: '', amount: '', category_id: '' });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmitFixed} className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Descripción</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ej: Renta, servicios..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Monto (COP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    value={formatInputCOP(form.amount)}
                    onChange={e => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Categoría</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-all"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        )}

        {/* Fixed Expenses List */}
        <div className="space-y-2">
          {fixedExpenses.map(expense => (
            <div
              key={expense.id}
              className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{expense.category_icon || '📌'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-dark-500">
                    {expense.category_name || 'Sin categoría'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                  -{formatCOP(expense.amount)}
                </span>
                <button
                  onClick={() => {
                    setEditingId(expense.id);
                    setForm({
                      description: expense.description,
                      amount: String(expense.amount),
                      category_id: expense.category_id ? String(expense.category_id) : '',
                    });
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteFixed(expense.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {fixedExpenses.length === 0 && !showForm && (
            <div className="text-center py-8 text-gray-400 dark:text-dark-500">
              <p className="text-sm">Sin gastos fijos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 space-y-2">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Cómo funciona</h3>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Puedes editar tu saldo disponible en cualquier momento</li>
          <li>Los gastos fijos se restan automáticamente del saldo (para referencia)</li>
          <li>Tu saldo se incrementa cada 15 y 30 del mes con tu salario mensual</li>
          <li>Usa gastos fijos para registrar pagos recurrentes (renta, servicios, etc)</li>
        </ul>
      </div>
    </div>
  );
}
