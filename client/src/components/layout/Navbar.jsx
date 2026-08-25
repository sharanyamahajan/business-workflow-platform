import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { Bell, User, LogOut, ChevronDown, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

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
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black shadow-xs text-base tracking-tighter">
            W
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-slate-900 text-base tracking-tight">WorkflowOps</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded">v1.0</span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">

          {/* Integrated Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-xs font-semibold text-slate-800 transition"
              title="Switch role instantly to test RBAC & stage approvals"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
              <span className="text-slate-400 font-normal">Persona:</span>
              <span className="text-indigo-700 font-bold">{user.full_name} ({user.role_code})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span>Switch Persona (RBAC Test)</span>
                  <Zap className="w-3 h-3 text-indigo-500" />
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchDemoUser(u.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50/60 transition ${
                      user.email === u.email ? 'bg-indigo-50/90 font-bold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{u.label}</div>
                      <div className="text-[10px] text-slate-400">{u.dept}</div>
                    </div>
                    {user.email === u.email && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Integrated Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Notifications</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No unread notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 text-xs border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${
                        !n.is_read ? 'bg-indigo-50/40 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <div className="text-slate-600 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
              <div className="text-[10px] text-slate-500">{user.dept_name}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
