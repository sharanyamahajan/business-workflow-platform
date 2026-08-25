import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { Bell, User, LogOut, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 text-lg">
            W
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">WorkflowOps</span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">v1.0</span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-4">

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              title="Switch role instantly to test RBAC & stage approvals"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500">Persona:</span>
              <span className="text-blue-700 font-bold">{user.full_name} ({user.role_code})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Switch Persona (RBAC Test)
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchDemoUser(u.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition ${
                      user.email === u.email ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{u.label}</div>
                      <div className="text-[10px] text-slate-400">{u.dept}</div>
                    </div>
                    {user.email === u.email && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* In-App Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">In-App Notifications</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 text-xs border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${
                        !n.is_read ? 'bg-blue-50/50 font-medium' : 'text-slate-600'
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
              <div className="text-[10px] text-slate-500 capitalize">{user.dept_name}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
