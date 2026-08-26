import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { Bell, LogOut, ChevronDown, CheckCircle2, ShieldCheck, Terminal, Cpu } from 'lucide-react';

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
    <header className="bg-[#E0E5EC] neu-extruded sticky top-0 z-30 font-body text-[#3D4852]">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#6C63FF] font-display font-extrabold text-base">
            W
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-lg tracking-tight text-[#3D4852]">WorkflowOps</span>
            <span className="text-[10px] font-mono font-bold text-[#6C63FF] neu-inset-sm px-2 py-0.5 rounded-full">
              SOFT_UI_v1.0
            </span>
          </div>
        </div>

        {/* Tools Toolbar */}
        <div className="flex items-center gap-4">

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl neu-button-secondary text-xs font-medium text-[#3D4852] neu-focus-ring"
              title="Switch role instantly to test RBAC & stage approvals"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF] shrink-0" />
              <span className="text-[#6B7280]">Persona:</span>
              <span className="font-display font-bold text-[#3D4852]">{user.full_name} ({user.role_code})</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-[#E0E5EC] rounded-3xl neu-extruded p-2 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#6B7280]/20 mb-1 flex items-center justify-between">
                  <span>PERSONA_RBAC_SWITCHER</span>
                  <Cpu className="w-3.5 h-3.5 text-[#6C63FF]" />
                </div>
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchDemoUser(u.email);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-2xl transition ${
                      user.email === u.email ? 'neu-inset font-bold text-[#6C63FF]' : 'hover:neu-extruded-sm text-[#3D4852]'
                    }`}
                  >
                    <div>
                      <div className="font-display font-bold">{u.label}</div>
                      <div className="text-[10px] text-[#6B7280] font-mono">{u.dept}</div>
                    </div>
                    {user.email === u.email && <CheckCircle2 className="w-4 h-4 text-[#6C63FF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-2xl neu-button-secondary flex items-center justify-center text-[#3D4852] relative neu-focus-ring"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E53E3E] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#E0E5EC] rounded-3xl neu-extruded p-3 z-50 max-h-96 overflow-y-auto">
                <div className="px-2 py-1 border-b border-[#6B7280]/20 flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-xs text-[#3D4852]">Notifications</span>
                  <span className="text-[10px] font-bold neu-inset-sm px-2 py-0.5 rounded-full text-[#6C63FF]">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#6B7280] font-mono">NO_NOTIFICATIONS</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 text-xs rounded-2xl mb-1 cursor-pointer transition ${
                        !n.is_read ? 'neu-inset font-semibold text-[#3D4852]' : 'text-[#6B7280]'
                      }`}
                    >
                      <div className="font-display font-bold text-[#3D4852]">{n.title}</div>
                      <div className="text-[#6B7280] mt-0.5 text-[11px]">{n.message}</div>
                      <div className="text-[10px] text-[#6C63FF] font-mono mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#6B7280]/20">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-display font-bold text-[#3D4852]">{user.full_name}</div>
              <div className="text-[10px] text-[#6B7280]">{user.dept_name}</div>
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 rounded-2xl neu-button-secondary flex items-center justify-center text-[#E53E3E] neu-focus-ring"
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
