import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  AlertTriangle,
  BarChart2,
  Settings,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/pipeline', label: 'Pipeline', icon: LayoutGrid },
  { to: '/claims', label: 'Claims', icon: FileText },
  { to: '/anomalies', label: 'Anomalies', icon: AlertTriangle },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
];

const roleBadgeColors: Record<string, string> = {
  ADMIN: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  REVIEWER: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  AUDITOR: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
};

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { user, logout, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-lg tracking-tight">ChainRx</div>
          <div className="text-slate-400 text-xs">Claims Intelligence</div>
        </div>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-white md:hidden transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {hasPermission('admin') && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-4">
              Administration
            </div>
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              <Settings size={18} />
              Settings
            </NavLink>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-sky-300 text-sm font-semibold">
              {user?.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name}</div>
            <div className="text-slate-400 text-xs truncate">{user?.email}</div>
          </div>
        </div>
        {user?.role && (
          <div className="mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleBadgeColors[user.role]}`}>
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-full py-1.5 px-2 rounded-lg hover:bg-slate-700/50"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 bg-slate-900 h-screen fixed left-0 top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-64 bg-slate-900 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
