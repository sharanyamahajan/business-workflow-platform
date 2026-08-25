import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { Bell, User, LogOut, ChevronDown, CheckCircle2, ShieldCheck, Zap, Terminal } from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchDemoUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed notifications fetch:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-2xs font-sans text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-teal-700 flex items-center justify-center text-white font-mono font-bold text-xs">
            W
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-slate-100 text-sm tracking-tight font-sans">WorkflowOps</span>
            <span className="text-[9px] font-mono font-bold text-teal-400 bg-teal-950 border border-teal-800 px-1.5 py-0.5 rounded-xs">v1.0_PROD</span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xs border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 transition"
              title="Switch role instantly to test RBAC & stage approvals"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              <span className="text-slate-400 font-normal">Persona:</span>
              <span className="text-teal-400 font-mono font-bold">{user.full_name} ({user.role_code})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-1 w-72 bg-slate-900 rounded-xs shadow-xl border border-slate-800 py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1 flex items-center justify-between">
                  <span>PERSONA_RBAC_SWITCHER</span>
                  <Terminal className="w-3 h-3 text-teal-400" />
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchDemoUser(u.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      user.email === u.email ? 'bg-slate-800 font-bold text-teal-400' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">{u.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.dept}</div>
                    </div>
                    {user.email === u.email && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900 transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-rose-600 text-white text-[8px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1 w-80 bg-slate-900 rounded-xs shadow-xl border border-slate-800 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-200">NOTIFICATIONS</span>
                  <span className="text-[10px] font-mono bg-teal-950 text-teal-400 border border-teal-800 px-1.5 py-0.5 rounded">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-mono">NO_UNREAD_NOTIFICATIONS</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 text-xs border-b border-slate-800/60 cursor-pointer hover:bg-slate-800 transition ${
                        !n.is_read ? 'bg-slate-800/80 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">{n.title}</div>
                      <div className="text-slate-400 mt-0.5 text-[11px]">{n.message}</div>
                      <div className="text-[9px] font-mono text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200">{user.full_name}</div>
              <div className="text-[10px] text-slate-400">{user.dept_name}</div>
            </div>
            <button
              onClick={logout}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
