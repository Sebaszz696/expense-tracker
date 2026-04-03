import { useState, useEffect } from 'react';
import { api } from '../context/api';
import { Summary } from '../types';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    api.getSummary(month, year).then(setSummary);
    api.getAvailable().then(data => setAvailable(data.available_balance));
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  if (!summary) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>;

  const usagePercent = summary.totalIncome > 0 ? Math.min((summary.totalExpenses / summary.totalIncome) * 100, 100) : 0;
  const pieData = summary.byCategory.filter(c => c.total > 0);

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/40 dark:to-cyan-900/40 rounded-2xl p-5 shadow-sm border-2 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-cyan-200 dark:bg-cyan-900 rounded-xl">
              <Wallet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">💰 DISPONIBLE</span>
          </div>
          <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{formatCOP(available)}</p>
          <p className="text-xs text-cyan-600 dark:text-cyan-300 mt-1">Lo que tienes ahora</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-dark-400">Gastos</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCOP(summary.totalExpenses)}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-dark-400">Ingresos (mes)</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCOP(summary.totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-xl">
              <PiggyBank className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-dark-400">Restante (mes)</span>
          </div>
          <p className={`text-lg font-bold ${(available - summary.totalExpenses) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCOP(available - summary.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-dark-300">Presupuesto utilizado</span>
          <span className="text-sm text-gray-500 dark:text-dark-400">
            {formatCOP(summary.totalExpenses)} / {formatCOP(summary.totalIncome)}
          </span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-primary-500'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos por Categoría</h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCOP(value)}
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg, #1e293b)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-400 dark:text-dark-500 py-12">Sin gastos este mes</p>
          )}
        </div>

        {/* Category List */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalle por Categoría</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {summary.byCategory
              .filter(c => c.total > 0)
              .map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</p>
                      {cat.budget_limit > 0 && (
                        <p className="text-xs text-gray-400 dark:text-dark-500">
                          Límite: {formatCOP(cat.budget_limit)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCOP(cat.total)}</p>
                    {summary.totalExpenses > 0 && (
                      <p className="text-xs text-gray-400 dark:text-dark-500">
                        {((cat.total / summary.totalExpenses) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            {summary.byCategory.filter(c => c.total > 0).length === 0 && (
              <p className="text-center text-gray-400 dark:text-dark-500 py-8">Sin gastos este mes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
