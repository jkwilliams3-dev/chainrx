import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, LogOut, Settings, ChevronDown, CheckCheck,
  AlertTriangle, FileCheck, AlertCircle, Info,
  LayoutDashboard, FileText, Zap, BarChart2, Menu, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Notification {
  id: string;
  type: 'anomaly' | 'claim' | 'alert' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: '1', type: 'anomaly', title: 'Anomaly Detected', message: 'Duplicate submission flagged for claim CLM-0847 — Methodist Health System', time: '2m ago', read: false },
  { id: '2', type: 'alert', title: 'High Value Claim', message: 'Claim CLM-0312 ($48,200) entered REVIEW queue — manual approval required', time: '11m ago', read: false },
  { id: '3', type: 'claim', title: 'Claim Resolved', message: 'CLM-0156 approved and paid — $12,450 to UT Southwestern Medical', time: '34m ago', read: false },
  { id: '4', type: 'anomaly', title: 'Billing Frequency Alert', message: 'Provider Baylor Scott & White exceeded 5 submissions/hour threshold', time: '1h ago', read: true },
  { id: '5', type: 'claim', title: 'Batch Processed', message: '23 claims moved from INTAKE to VERIFICATION automatically', time: '2h ago', read: true },
  { id: '6', type: 'info', title: 'System Update', message: 'Anomaly detection model retrained — accuracy improved to 94.2%', time: '3h ago', read: true },
  { id: '7', type: 'alert', title: 'SLA Warning', message: '8 claims approaching 30-day resolution deadline', time: '4h ago', read: true },
];

const notifIcon = (type: Notification['type']) => {
  switch (type) {
    case 'anomaly': return <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />;
    case 'alert':   return <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />;
    case 'claim':   return <FileCheck size={13} className="text-emerald-500 mt-0.5 shrink-0" />;
    case 'info':    return <Info size={13} className="text-sky-500 mt-0.5 shrink-0" />;
  }
};

const navItems = [
  { to: '/pipeline',  label: 'Pipeline',  icon: LayoutDashboard },
  { to: '/claims',    label: 'Claims',    icon: FileText },
  { to: '/anomalies', label: 'Anomalies', icon: Zap },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

export default function TopNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unread = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(n => n.map(i => ({ ...i, read: true })));
  const markRead = (id: string) => setNotifications(n => n.map(i => i.id === id ? { ...i, read: true } : i));

  const closeAll = () => { setUserOpen(false); setNotifOpen(false); setMobileOpen(false); };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Main nav row */}
      <div className="flex items-center h-16 px-4 md:px-6 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">Rx</span>
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight">ChainRx</span>
          <span className="hidden sm:block text-xs text-slate-400 font-medium border border-slate-200 rounded px-1.5 py-0.5 ml-1">Claims Intelligence</span>
        </div>

        {/* Desktop nav tabs */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1 md:hidden" />

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(v => !v); setUserOpen(false); }}
              className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-800">Notifications</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium">
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-sky-50/40' : ''}`}
                      >
                        {notifIcon(n.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold truncate ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                    <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">View all notifications</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-slate-800 leading-tight">{user?.name}</div>
                <div className="text-xs text-slate-500 leading-tight capitalize">{user?.role?.toLowerCase()}</div>
              </div>
              <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
            </button>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { closeAll(); navigate('/settings'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-slate-100 px-4 py-3 flex flex-col gap-1 bg-white">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
