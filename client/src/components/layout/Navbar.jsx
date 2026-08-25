import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { Bell, LogOut, ChevronDown, CheckCircle2, ShieldCheck, Sparkles, Command, ArrowRight } from 'lucide-react';

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
    <header className="bg-[#050814]/80 backdrop-blur-xl border-b border-blue-900/20 sticky top-0 z-40 font-sans text-white shadow-2xl shadow-blue-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Amber/Gold Logo Brand */}
        <div className="flex items-center gap-3">
          <div className="text-amber-400 font-black text-lg tracking-tight flex items-center gap-1">
            <span className="text-amber-400 font-extrabold text-xl">/</span>logo
          </div>
          <div className="flex items-baseline gap-2 pl-2 border-l border-slate-800">
            <span className="font-extrabold text-sm tracking-tight text-white">WorkflowOps</span>
            <span className="text-[9px] font-mono font-bold text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
              v1.0 AI
            </span>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-3">

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-slate-900/80 hover:bg-blue-950/30 text-xs font-medium text-slate-200 transition backdrop-blur-md shadow-xs"
              title="Switch role instantly to test RBAC & stage approvals"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-400 font-normal">Persona:</span>
              <span className="text-amber-300 font-mono font-bold">{user.full_name} ({user.role_code})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-[#090e24]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-blue-500/30 py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 py-1.5 text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>PERSONA_RBAC_SWITCHER</span>
                  <Command className="w-3 h-3 text-amber-400" />
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchDemoUser(u.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-blue-600/15 transition rounded-xl ${
                      user.email === u.email ? 'bg-blue-600/20 font-bold text-amber-300 border border-amber-500/30' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">{u.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.dept}</div>
                    </div>
                    {user.email === u.email && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-blue-950/30 transition relative border border-transparent hover:border-blue-500/20"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#090e24]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-blue-500/30 py-2.5 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-200">NOTIFICATIONS</span>
                  <span className="text-[10px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500 font-mono">NO_UNREAD_NOTIFICATIONS</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3.5 text-xs border-b border-slate-800/40 cursor-pointer hover:bg-blue-600/10 transition ${
                        !n.is_read ? 'bg-blue-950/20 font-medium text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-slate-100">{n.title}</div>
                      <div className="text-slate-400 mt-0.5 text-[11px]">{n.message}</div>
                      <div className="text-[9px] font-mono text-blue-400/80 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Pure White Action Button matching reference image */}
          <button
            onClick={logout}
            className="px-4 py-1.5 bg-white text-slate-950 font-bold text-xs rounded-full shadow-lg hover:bg-slate-100 transition flex items-center gap-1.5 border border-white/20"
          >
            <span>Sign Out</span>
            <LogOut className="w-3.5 h-3.5 text-slate-950" />
          </button>

        </div>

      </div>
    </header>
  );
}
