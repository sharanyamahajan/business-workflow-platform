import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  CheckSquare, 
  BarChart3, 
  ShieldCheck,
  Layers,
  Inbox
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const isAdminOrOps = ['SYSTEM_ADMIN', 'OPERATIONS_MANAGER'].includes(user.role_code);
  const isManagerOrHead = ['REPORTING_MANAGER', 'DEPARTMENT_HEAD'].includes(user.role_code);
  const isStaff = user.role_code === 'DEPARTMENT_STAFF';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between border-r border-slate-800">
      <div className="space-y-6">
        
        {/* Navigation Group Main */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-3">
            Main Navigation
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold' : 'hover:bg-slate-800 hover:text-white'
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              <span>All Requests</span>
            </NavLink>

            <NavLink
              to="/requests/create"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 transition ${
                  isActive ? 'bg-emerald-600 text-white border-emerald-600' : ''
                }`
              }
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span>New Request</span>
            </NavLink>
          </nav>
        </div>

        {/* Role-Specific Workqueues */}
        {(isManagerOrHead || isStaff) && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-3">
              Action Queues
            </div>
            <nav className="space-y-1">
              {isManagerOrHead && (
                <NavLink
                  to="/requests?scope=pending_approval"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    <span>Pending Approvals</span>
                  </div>
                </NavLink>
              )}

              {isStaff && (
                <NavLink
                  to="/requests?scope=dept_queue"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Inbox className="w-4 h-4 text-purple-400" />
                    <span>Dept Work Queue</span>
                  </div>
                </NavLink>
              )}
            </nav>
          </div>
        )}

        {/* Admin & Operations */}
        {isAdminOrOps && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-3">
              Administration
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Workflow & Users</span>
              </NavLink>
            </nav>
          </div>
        )}

      </div>

      {/* Footer Role Badge */}
      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 text-xs">
        <div className="text-[10px] text-slate-400 font-semibold uppercase">Current Role Scope</div>
        <div className="font-bold text-white mt-0.5">{user.role_name}</div>
        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-blue-400" />
          <span>{user.dept_name} Dept</span>
        </div>
      </div>

    </aside>
  );
}
