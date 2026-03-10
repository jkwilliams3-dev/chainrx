import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronRight, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface TopBarProps {
  onMenuClick: () => void;
}

const breadcrumbMap: Record<string, string> = {
  '/pipeline': 'Pipeline',
  '/claims': 'Claims',
  '/anomalies': 'Anomalies',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentPage = breadcrumbMap[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-20">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="text-slate-400 hidden sm:inline">ChainRx</span>
        <ChevronRight size={14} className="text-slate-300 hidden sm:inline" />
        <span className="text-slate-800 font-semibold">{currentPage}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell */}
      <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-slate-800 leading-tight">{user?.name}</div>
            <div className="text-xs text-slate-500 leading-tight">{user?.role}</div>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings size={14} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
