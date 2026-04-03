import { useState, useEffect } from 'react';
import { api } from '../context/api';
import { Summary } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line,
} from 'recharts';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const shortCOP = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '13px',
};

export default function Charts() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api.getSummary(month, year).then(setSummary);
  }, [month, year]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  if (!summary) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>;

  const categoryData = summary.byCategory.filter(c => c.total > 0);

  const dailyData = summary.dailyExpenses.map(d => ({
    date: new Date(d.date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
    total: d.total,
  }));

  // Accumulative data
  let acc = 0;
  const accumulativeData = summary.dailyExpenses.map(d => {
    acc += d.total;
    return {
      date: new Date(d.date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
      acumulado: acc,
      limite: summary.totalIncome,
    };
  });

  // Budget vs Spent
  const budgetData = summary.byCategory
    .filter(c => c.budget_limit > 0)
    .map(c => ({
      name: c.name,
      presupuesto: c.budget_limit,
      gastado: c.total,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gráficas</h2>
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Categoría</h3>
          {categoryData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={2}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCOP(v)} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-16">Sin datos</p>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-xs text-gray-500 dark:text-dark-400">{c.icon} {c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Area Chart */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos Diarios</h3>
          {dailyData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tickFormatter={shortCOP} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCOP(v)} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#colorTotal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-16">Sin datos</p>
          )}
        </div>

        {/* Accumulative Line Chart */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gasto Acumulado vs Ingreso</h3>
          {accumulativeData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accumulativeData}>
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tickFormatter={shortCOP} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCOP(v)} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="acumulado" stroke="#ef4444" strokeWidth={2} dot={false} name="Gasto acumulado" />
                  <Line type="monotone" dataKey="limite" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ingreso total" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-16">Sin datos</p>
          )}
        </div>

        {/* Budget vs Spent Bar Chart */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Presupuesto vs Gastado</h3>
          {budgetData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} layout="vertical">
                  <XAxis type="number" tickFormatter={shortCOP} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
                  <Tooltip formatter={(v: number) => formatCOP(v)} contentStyle={tooltipStyle} />
                  <Bar dataKey="presupuesto" fill="#6366f1" radius={[0, 4, 4, 0]} name="Presupuesto" />
                  <Bar dataKey="gastado" fill="#ef4444" radius={[0, 4, 4, 0]} name="Gastado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-16">Configura presupuestos por categoría</p>
          )}
        </div>
      </div>
    </div>
  );
}
