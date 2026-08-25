import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Inbox,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const roleCode = user.role_code;

  return (
    <aside className="w-60 bg-[#060a18]/70 backdrop-blur-xl border-r border-blue-900/20 flex flex-col justify-between shrink-0 shadow-2xl shadow-blue-950/20 font-sans text-slate-300">
      
      <div className="p-3.5 space-y-6">
        
        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 text-[9px] font-mono font-bold text-blue-400/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>OPERATIONS_PORTAL</span>
          </div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition backdrop-blur-md ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white font-bold border border-blue-500/40 shadow-lg shadow-blue-950/40'
                  : 'text-slate-400 hover:bg-blue-950/20 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/requests"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition backdrop-blur-md ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white font-bold border border-blue-500/40 shadow-lg shadow-blue-950/40'
                  : 'text-slate-400 hover:bg-blue-950/20 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            <Inbox className="w-4 h-4 text-indigo-400" />
            <span>Requests Queue</span>
          </NavLink>

          {/* Pure White Action Pill matching reference image */}
          <NavLink
            to="/requests/create"
            className="flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-xl transition border border-white/20 mt-2"
          >
            <span>Create Request</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </NavLink>
        </div>

        {/* Work Queues Section */}
        <div className="space-y-1 pt-4 border-t border-blue-900/20">
          <div className="px-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            WORKFLOW_QUEUES
          </div>

          <NavLink
            to="/requests?scope=my_requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                isActive
                  ? 'bg-blue-950/30 text-blue-300 font-bold border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
              }`
            }
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>My Submissions</span>
          </NavLink>

          {(roleCode === 'REPORTING_MANAGER' || roleCode === 'DEPARTMENT_HEAD' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=pending_approval"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                  isActive
                    ? 'bg-amber-950/30 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`
              }
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Pending Approvals</span>
            </NavLink>
          )}

          {(roleCode === 'DEPARTMENT_STAFF' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=dept_queue"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                  isActive
                    ? 'bg-blue-950/30 text-blue-300 font-bold border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`
              }
            >
              <CheckSquare className="w-4 h-4 text-slate-400" />
              <span>Department Queue</span>
            </NavLink>
          )}

          {(roleCode === 'SYSTEM_ADMIN' || roleCode === 'OPERATIONS_MANAGER') && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                  isActive
                    ? 'bg-blue-950/30 text-blue-300 font-bold border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`
              }
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Administration</span>
            </NavLink>
          )}
        </div>

      </div>

      {/* Glass Profile Footer */}
      <div className="p-3.5 m-3.5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-blue-950/40 border border-blue-500/20 backdrop-blur-md shadow-xl text-xs">
        <div className="flex items-center gap-2.5 text-slate-100 font-bold text-[11px]">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">{user.role_name}</span>
        </div>
        <div className="text-[10px] text-blue-300/80 font-mono mt-0.5">{user.dept_name} Department</div>
      </div>

    </aside>
  );
}
