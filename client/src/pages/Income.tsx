import { useState, useEffect } from 'react';
import { api } from '../context/api';
import { useAuth } from '../context/AuthContext';
import { IncomeRecord } from '../types';
import { Plus, Trash2, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Income() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0], is_recurring: false });

  const load = () => api.getIncome(month, year).then(setRecords);

  useEffect(() => { load(); }, [month, year]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createIncome({
      description: form.description,
      amount: Number(form.amount.replace(/\D/g, '')),
      date: form.date,
      is_recurring: form.is_recurring,
    });
    setForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0], is_recurring: false });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await api.deleteIncome(id);
    load();
  };

  const formatInputCOP = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('es-CO') : '';
  };

  const additionalTotal = records.reduce((s, r) => s + r.amount, 0);
  const totalIncome = (user?.monthlyIncome || 0) + additionalTotal;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ingresos</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-dark-800 rounded-xl px-2 py-1 shadow-sm">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg text-gray-500 dark:text-dark-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-dark-200 min-w-[130px] text-center">
              {MONTHS[month - 1]} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg text-gray-500 dark:text-dark-400">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>

      {/* Income Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500 dark:text-dark-400">Salario Mensual</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCOP(user?.monthlyIncome || 0)}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-dark-400">Ingresos Adicionales</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCOP(additionalTotal)}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-gray-500 dark:text-dark-400">Total del Mes</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCOP(totalIncome)}</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Fuente de ingreso"
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
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_recurring}
                  onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-dark-300">Ingreso recurrente</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-all">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all">
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* Income List */}
      <div className="space-y-2">
        {records.map(record => (
          <div key={record.id} className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">💰</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{record.description}</p>
                <p className="text-xs text-gray-400 dark:text-dark-500">
                  {new Date(record.date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  {record.is_recurring ? ' · Recurrente' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                +{formatCOP(record.amount)}
              </span>
              <button onClick={() => handleDelete(record.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-dark-500">
            <p className="text-lg mb-2">Sin ingresos adicionales</p>
            <p className="text-sm">Tu salario mensual ya está configurado</p>
          </div>
        )}
      </div>
    </div>
  );
}
