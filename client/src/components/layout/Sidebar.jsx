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
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const roleCode = user.role_code;

  return (
    <aside className="w-60 bg-[#090a10]/70 backdrop-blur-xl border-r border-purple-900/20 flex flex-col justify-between shrink-0 shadow-2xl shadow-purple-950/20 font-sans text-slate-300">
      
      <div className="p-3.5 space-y-6">
        
        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 text-[9px] font-mono font-bold text-purple-400/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>OPERATIONS_PORTAL</span>
          </div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition backdrop-blur-md ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white font-bold border border-purple-500/40 shadow-lg shadow-purple-950/40'
                  : 'text-slate-400 hover:bg-violet-950/20 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/requests"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition backdrop-blur-md ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-white font-bold border border-purple-500/40 shadow-lg shadow-purple-950/40'
                  : 'text-slate-400 hover:bg-violet-950/20 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            <Inbox className="w-4 h-4 text-indigo-400" />
            <span>Requests Queue</span>
          </NavLink>

          <NavLink
            to="/requests/create"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition backdrop-blur-md ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-600/30 border border-purple-400/30'
                  : 'text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30'
              }`
            }
          >
            <PlusCircle className="w-4 h-4 text-purple-300" />
            <span className="font-bold">Create Request</span>
          </NavLink>
        </div>

        {/* Work Queues Section */}
        <div className="space-y-1 pt-4 border-t border-purple-900/20">
          <div className="px-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            WORKFLOW_QUEUES
          </div>

          <NavLink
            to="/requests?scope=my_requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition ${
                isActive
                  ? 'bg-purple-950/30 text-purple-300 font-bold border border-purple-500/30'
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
                    ? 'bg-purple-950/30 text-purple-300 font-bold border border-purple-500/30'
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
                    ? 'bg-purple-950/30 text-purple-300 font-bold border border-purple-500/30'
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

      {/* Glassmorphism Profile Footer */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-slate-900/80 to-purple-950/40 border border-purple-500/20 backdrop-blur-md shadow-xl text-xs">
        <div className="flex items-center gap-2.5 text-slate-100 font-bold text-[11px]">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="truncate">{user.role_name}</span>
        </div>
        <div className="text-[10px] text-purple-300/80 font-mono mt-0.5">{user.dept_name} Department</div>
      </div>

    </aside>
  );
}
