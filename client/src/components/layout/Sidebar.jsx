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
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const roleCode = user.role_code;

  return (
    <aside className="w-60 bg-[#0F1115] border-r border-white/10 flex flex-col justify-between shrink-0 font-body text-slate-300 shadow-[10px_0_30px_rgba(0,0,0,0.8)]">
      
      <div className="p-4 space-y-6">
        
        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 text-[9px] font-mono font-bold text-[#F7931A] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#F7931A]" />
            <span>CHAIN_PORTAL</span>
          </div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-heading font-bold shadow-[0_0_20px_-5px_rgba(247,147,26,0.6)] border border-[#FFD600]/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-[#F7931A]" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/requests"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-heading font-bold shadow-[0_0_20px_-5px_rgba(247,147,26,0.6)] border border-[#FFD600]/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <Inbox className="w-4 h-4 text-[#FFD600]" />
            <span>Requests Queue</span>
          </NavLink>

          {/* Signature Bitcoin Orange Action Pill */}
          <NavLink
            to="/requests/create"
            className="flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-heading font-bold bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] text-white shadow-[0_0_25px_-5px_rgba(234,88,12,0.6)] hover:scale-105 transition-all duration-300 border border-white/20 mt-3"
          >
            <span>Create Request</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </NavLink>
        </div>

        {/* Work Queues Section */}
        <div className="space-y-1 pt-4 border-t border-white/10">
          <div className="px-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            LEDGER_QUEUES
          </div>

          <NavLink
            to="/requests?scope=my_requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition ${
                isActive ? 'bg-[#F7931A]/20 text-[#FFD600] font-bold border border-[#F7931A]/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
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
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition ${
                  isActive ? 'bg-[#FFD600]/20 text-[#FFD600] font-bold border border-[#FFD600]/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <UserCheck className="w-4 h-4 text-[#FFD600]" />
              <span>Pending Approvals</span>
            </NavLink>
          )}

          {(roleCode === 'DEPARTMENT_STAFF' || roleCode === 'SYSTEM_ADMIN') && (
            <NavLink
              to="/requests?scope=dept_queue"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition ${
                  isActive ? 'bg-[#F7931A]/20 text-[#FFD600] font-bold border border-[#F7931A]/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
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
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition ${
                  isActive ? 'bg-[#F7931A]/20 text-[#FFD600] font-bold border border-[#F7931A]/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Administration</span>
            </NavLink>
          )}
        </div>

      </div>

      {/* Profile Footer */}
      <div className="p-3.5 m-3.5 rounded-2xl bg-[#030304]/80 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md text-xs">
        <div className="flex items-center gap-2.5 text-white font-heading font-bold text-[11px]">
          <ShieldCheck className="w-4 h-4 text-[#F7931A] shrink-0" />
          <span className="truncate">{user.role_name}</span>
        </div>
        <div className="text-[10px] text-[#FFD600] font-mono mt-0.5">{user.dept_name} Department</div>
      </div>

    </aside>
  );
}
