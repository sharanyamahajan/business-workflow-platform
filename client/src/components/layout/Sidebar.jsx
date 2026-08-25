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
  Layers,
  Inbox
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const roleCode = user.role_code;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 shadow-2xs">
      
      <div className="p-4 space-y-6">
        
        {/* Primary Navigation Links */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Portal
          </div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/requests"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Inbox className="w-4 h-4" />
            <span>Central Requests Queue</span>
          </NavLink>

          <NavLink
            to="/requests/create"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-indigo-700 font-bold">New Request</span>
          </NavLink>
        </div>

        {/* Role-Specific Work Queues Shortcuts */}
        <div className="space-y-1 pt-4 border-t border-slate-100">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Role Work Queues
          </div>

          <NavLink
            to="/requests?scope=my_requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isActive ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
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
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Pending Approvals</span>
            </NavLink>
          )}

          {(roleCode === 'DEPARTMENT_STAFF' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=dept_queue"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <CheckSquare className="w-4 h-4 text-purple-500" />
              <span>Department Queue</span>
            </NavLink>
          )}

          {(roleCode === 'SYSTEM_ADMIN' || roleCode === 'OPERATIONS_MANAGER') && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>Administration</span>
            </NavLink>
          )}
        </div>

      </div>

      {/* Streamlined Role Footer (No Dead Space) */}
      <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="truncate">{user.role_name}</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{user.dept_name} Department</div>
      </div>

    </aside>
  );
}
