import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, Save } from 'lucide-react';

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { dark, toggle } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState(String(user?.monthlyIncome || 0));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, monthlyIncome: Number(income.replace(/\D/g, '') || 0) } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const formatInputCOP = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('es-CO') : '';
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</h2>

      {/* Theme */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apariencia</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-dark-300">Tema</p>
            <p className="text-xs text-gray-400 dark:text-dark-500">Cambia entre modo oscuro y claro</p>
          </div>
          <button
            onClick={toggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              dark
                ? 'bg-dark-700 text-yellow-400 hover:bg-dark-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
        </div>
      </div>

      {/* Profile */}
      <form onSubmit={handleSave} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-500 dark:text-dark-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">
            Ingreso Mensual (COP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              value={formatInputCOP(income)}
              onChange={e => setIncome(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          {user?.monthlyIncome ? (
            <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
              Actualmente: {formatCOP(user.monthlyIncome)}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : saved ? 'Guardado!' : 'Guardar Cambios'}
        </button>
      </form>

      {/* Info */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Acerca de</h3>
        <p className="text-sm text-gray-500 dark:text-dark-400">
          MisGastos v1.0 — Tu control de finanzas personales.
        </p>
        <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
          Moneda: COP (Pesos Colombianos)
        </p>
      </div>
    </div>
  );
}
