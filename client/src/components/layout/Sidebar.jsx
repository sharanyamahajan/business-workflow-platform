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
  Inbox
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const roleCode = user.role_code;

  return (
    <aside className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-2xs font-sans text-slate-300">
      
      <div className="p-3 space-y-5">
        
        {/* Navigation Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            SYSTEM_PORTAL
          </div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs transition ${
                isActive
                  ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`
            }
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/requests"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs transition ${
                isActive
                  ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`
            }
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Requests Queue</span>
          </NavLink>

          <NavLink
            to="/requests/create"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs transition ${
                isActive
                  ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-teal-400 font-bold">New Request</span>
          </NavLink>
        </div>

        {/* Work Queues Section */}
        <div className="space-y-0.5 pt-3 border-t border-slate-850">
          <div className="px-2.5 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            WORK_QUEUES
          </div>

          <NavLink
            to="/requests?scope=my_requests"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs transition ${
                isActive ? 'bg-slate-900 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-900'
              }`
            }
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>My Submissions</span>
          </NavLink>

          {(roleCode === 'REPORTING_MANAGER' || roleCode === 'DEPARTMENT_HEAD' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=pending_approval"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs transition ${
                  isActive ? 'bg-slate-900 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-900'
                }`
              }
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Approvals</span>
            </NavLink>
          )}

          {(roleCode === 'DEPARTMENT_STAFF' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=dept_queue"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs transition ${
                  isActive ? 'bg-slate-900 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-900'
                }`
              }
            >
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Department Queue</span>
            </NavLink>
          )}

          {(roleCode === 'SYSTEM_ADMIN' || roleCode === 'OPERATIONS_MANAGER') && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs transition ${
                  isActive ? 'bg-slate-900 text-teal-400 font-bold' : 'text-slate-400 hover:bg-slate-900'
                }`
              }
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Administration</span>
            </NavLink>
          )}
        </div>

      </div>

      {/* Streamlined Footer */}
      <div className="p-2.5 m-2.5 rounded-xs bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-[11px]">
          <ShieldCheck className="w-3 h-3 text-teal-400" />
          <span className="truncate">{user.role_name}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.dept_name}</div>
      </div>

    </aside>
  );
}
