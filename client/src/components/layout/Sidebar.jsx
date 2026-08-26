import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  ShieldCheck, 
  Clock, 
  CheckSquare, 
  UserCheck, 
  Settings,
  Inbox
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleCode = user.role_code;

  const isScopeActive = (targetScope) => {
    if (location.pathname !== '/requests') return false;
    const params = new URLSearchParams(location.search);
    const currentScope = params.get('scope') || 'all';
    return currentScope === targetScope;
  };

  const isRouteActive = (targetPath) => {
    if (targetPath === '/requests') {
      if (location.pathname !== '/requests') return false;
      const params = new URLSearchParams(location.search);
      const currentScope = params.get('scope') || 'all';
      return currentScope === 'all';
    }
    return location.pathname === targetPath;
  };

  return (
    <aside className="w-60 bg-[#E0E5EC] p-4 flex flex-col justify-between shrink-0 font-body text-[#3D4852]">
      
      <div className="space-y-6">
        
        {/* Navigation Section */}
        <div className="space-y-2">
          <div className="px-3 text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider mb-2">
            OPERATIONS_PORTAL
          </div>

          <NavLink
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs transition ${
              isRouteActive('/dashboard')
                ? 'neu-inset text-[#6C63FF] font-display font-bold'
                : 'neu-button-secondary text-[#3D4852]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#6C63FF]" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/requests?scope=all"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs transition ${
              isRouteActive('/requests')
                ? 'neu-inset text-[#6C63FF] font-display font-bold'
                : 'neu-button-secondary text-[#3D4852]'
            }`}
          >
            <Inbox className="w-4 h-4 text-[#38B2AC]" />
            <span>Requests Queue</span>
          </NavLink>

          <NavLink
            to="/requests/create"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-display font-bold transition ${
              isRouteActive('/requests/create')
                ? 'neu-inset text-[#6C63FF]'
                : 'neu-button-primary text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Request</span>
          </NavLink>
        </div>

        {/* Work Queues Section */}
        <div className="space-y-2 pt-4 border-t border-[#6B7280]/20">
          <div className="px-3 text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider mb-2">
            WORKFLOW_QUEUES
          </div>

          <NavLink
            to="/requests?scope=my_requests"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs transition ${
              isScopeActive('my_requests') ? 'neu-inset text-[#6C63FF] font-bold' : 'neu-button-secondary text-[#6B7280]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Submissions</span>
          </NavLink>

          {(roleCode === 'REPORTING_MANAGER' || roleCode === 'DEPARTMENT_HEAD' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=pending_approval"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs transition ${
                isScopeActive('pending_approval') ? 'neu-inset text-[#DD6B20] font-bold' : 'neu-button-secondary text-[#6B7280]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#DD6B20]" />
              <span>Pending Approvals</span>
            </NavLink>
          )}

          {(roleCode === 'DEPARTMENT_STAFF' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=dept_queue"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs transition ${
                isScopeActive('dept_queue') ? 'neu-inset text-[#6C63FF] font-bold' : 'neu-button-secondary text-[#6B7280]'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Department Queue</span>
            </NavLink>
          )}

          {(roleCode === 'SYSTEM_ADMIN' || roleCode === 'OPERATIONS_MANAGER') && (
            <NavLink
              to="/admin"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs transition ${
                isRouteActive('/admin') ? 'neu-inset text-[#6C63FF] font-bold' : 'neu-button-secondary text-[#6B7280]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Administration</span>
            </NavLink>
          )}
        </div>

      </div>

      {/* Tactile Profile Card */}
      <div className="p-4 rounded-3xl neu-inset text-xs space-y-1">
        <div className="flex items-center gap-2 text-[#3D4852] font-display font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-[#6C63FF] shrink-0" />
          <span className="truncate">{user.role_name}</span>
        </div>
        <div className="text-[10px] text-[#6B7280] font-mono">{user.dept_name} Department</div>
      </div>

    </aside>
  );
}
