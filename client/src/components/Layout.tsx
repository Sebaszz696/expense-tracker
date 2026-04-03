import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Receipt, PiggyBank, BarChart3, Settings, LogOut, Menu, X, Wallet
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/expenses', icon: Receipt, label: 'Gastos' },
  { path: '/income', icon: Wallet, label: 'Ingresos' },
  { path: '/budget', icon: PiggyBank, label: 'Presupuesto' },
  { path: '/charts', icon: BarChart3, label: 'Gráficas' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 fixed h-full z-30">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <PiggyBank className="w-7 h-7" />
            MisGastos
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">Hola, {user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between px-4 z-40">
        <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
          <PiggyBank className="w-6 h-6" />
          MisGastos
        </h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600 dark:text-dark-300">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-72 h-full bg-white dark:bg-dark-900 p-4 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-6 pt-2">
              <p className="text-sm text-gray-500 dark:text-dark-400">Hola, {user?.name}</p>
            </div>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full mt-4 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 z-40 flex justify-around py-2">
        {navItems.slice(0, 5).map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all ${
              location.pathname === item.path
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-dark-500'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
