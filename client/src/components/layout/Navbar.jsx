import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { Bell, LogOut, ChevronDown, CheckCircle2, ShieldCheck, Terminal, Cpu, Flame } from 'lucide-react';

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
    <header className="bg-[#030304]/85 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 font-body text-white shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Glowing Bitcoin Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] p-0.5 shadow-[0_0_20px_-5px_rgba(247,147,26,0.8)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#030304] flex items-center justify-center font-mono font-extrabold text-[#F7931A] text-sm">
              ₿
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-base tracking-tight text-gradient-btc">
              WorkflowOps
            </span>
            <span className="text-[9px] font-mono font-bold text-[#FFD600] bg-[#FFD600]/10 border border-[#FFD600]/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,214,0,0.2)]">
              BTC_DEFI_ENGINE
            </span>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-3">

          {/* Persona Switcher Toolbar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-[#0F1115] hover:border-[#F7931A]/50 text-xs font-medium text-slate-200 transition shadow-[0_0_15px_rgba(247,147,26,0.1)]"
              title="Switch role instantly to test RBAC & stage approvals"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7931A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7931A]"></span>
              </span>
              <span className="text-slate-400 font-normal">Node Persona:</span>
              <span className="text-[#F7931A] font-mono font-bold">{user.full_name} ({user.role_code})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0F1115]/95 backdrop-blur-2xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)] border border-[#F7931A]/30 py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 py-1.5 text-[9px] font-mono font-bold text-[#FFD600] uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>NETWORK_RBAC_NODES</span>
                  <Cpu className="w-3.5 h-3.5 text-[#F7931A]" />
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchDemoUser(u.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F7931A]/10 transition rounded-xl ${
                      user.email === u.email ? 'bg-[#F7931A]/20 font-bold text-[#FFD600] border border-[#F7931A]/40' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white font-heading">{u.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.dept}</div>
                    </div>
                    {user.email === u.email && <CheckCircle2 className="w-4 h-4 text-[#F7931A]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition relative border border-transparent hover:border-white/10"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-bold flex items-center justify-center shadow-[0_0_10px_rgba(234,88,12,0.8)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0F1115]/95 backdrop-blur-2xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)] border border-white/15 py-2.5 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-white">BLOCKCHAIN_NOTIFICATIONS</span>
                  <span className="text-[10px] font-mono bg-[#F7931A]/20 text-[#FFD600] border border-[#F7931A]/40 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500 font-mono">NO_UNREAD_NOTIFICATIONS</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3.5 text-xs border-b border-white/5 cursor-pointer hover:bg-[#F7931A]/10 transition ${
                        !n.is_read ? 'bg-[#F7931A]/10 font-semibold text-slate-100' : 'text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-white font-heading">{n.title}</div>
                      <div className="text-slate-400 mt-0.5 text-[11px]">{n.message}</div>
                      <div className="text-[9px] font-mono text-[#F7931A] mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white font-heading">{user.full_name}</div>
              <div className="text-[10px] text-[#F7931A] font-mono">{user.dept_name}</div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-heading font-bold text-xs rounded-full shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-105 transition flex items-center gap-1.5"
              title="Sign Out"
            >
              <span>Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
