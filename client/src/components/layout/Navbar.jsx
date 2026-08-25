import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { Bell, User, LogOut, ChevronDown, CheckCircle2, ShieldCheck, Zap, Sparkles, Command } from 'lucide-react';

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
    <header className="bg-[#090a10]/80 backdrop-blur-xl border-b border-purple-900/20 sticky top-0 z-40 shadow-2xl shadow-purple-950/20 font-sans text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 ring-1 ring-white/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              WorkflowOps
            </span>
            <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full shadow-xs">
              AI_PROD v2.0
            </span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-500/20 bg-slate-900/80 hover:bg-purple-950/30 text-xs font-medium text-slate-200 transition backdrop-blur-md shadow-xs"
              title="Switch role instantly to test RBAC & stage approvals"
            >
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
              <span className="text-slate-400 font-normal">Persona:</span>
              <span className="text-purple-300 font-mono font-bold">{user.full_name} ({user.role_code})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0c0d14]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-purple-500/30 py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 py-1.5 text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>PERSONA_RBAC_SWITCHER</span>
                  <Command className="w-3 h-3 text-purple-400" />
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchDemoUser(u.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-violet-600/15 transition rounded-xl ${
                      user.email === u.email ? 'bg-violet-600/20 font-bold text-purple-300 border border-purple-500/30' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">{u.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.dept}</div>
                    </div>
                    {user.email === u.email && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-950/30 transition relative border border-transparent hover:border-purple-500/20"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0c0d14]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-purple-500/30 py-2.5 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-200">NOTIFICATIONS</span>
                  <span className="text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500 font-mono">NO_UNREAD_NOTIFICATIONS</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3.5 text-xs border-b border-slate-800/40 cursor-pointer hover:bg-violet-600/10 transition ${
                        !n.is_read ? 'bg-purple-950/20 font-medium text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-slate-100">{n.title}</div>
                      <div className="text-slate-400 mt-0.5 text-[11px]">{n.message}</div>
                      <div className="text-[9px] font-mono text-purple-400/80 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-100">{user.full_name}</div>
              <div className="text-[10px] text-purple-300/80 font-mono">{user.dept_name}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition border border-transparent hover:border-rose-500/20"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
