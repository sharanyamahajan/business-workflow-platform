import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge';
import SlaBadge from '../components/common/SlaBadge';
import { 
  FileText, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  BarChart2, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/metrics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed metrics fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading operational metrics...</div>;
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Scope: {user.role_name} • {user.dept_name} Department</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Operational Dashboard</h1>
          <p className="text-xs text-blue-200 mt-1">Real-time workflow monitoring, SLA compliance, and active work queues</p>
        </div>

        <Link
          to="/requests/create"
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
        >
          <span>Create New Request</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Role Card Metrics */}
      {metrics.role === 'EMPLOYEE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Active Requests</div>
            <div className="text-3xl font-black text-slate-900 mt-2">{metrics.activeCount}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">In workflow pipeline</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Action Required</div>
            <div className="text-3xl font-black text-orange-600 mt-2">{metrics.actionRequiredCount}</div>
            <div className="text-[11px] text-orange-600 font-semibold mt-1">Changes requested by reviewer</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Completed</div>
            <div className="text-3xl font-black text-emerald-600 mt-2">{metrics.completedCount}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Successfully fulfilled</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Overdue</div>
            <div className="text-3xl font-black text-rose-600 mt-2">{metrics.overdueCount}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">Exceeded target SLA</div>
          </div>
        </div>
      )}

      {metrics.role === 'REPORTING_MANAGER' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Pending My Approval</div>
            <div className="text-3xl font-black text-amber-600 mt-2">{metrics.pendingApprovalsCount}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">Action required from you</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Team Total Requests</div>
            <div className="text-3xl font-black text-slate-900 mt-2">{metrics.teamTotalCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">{user.dept_name} Department</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Overdue Team Requests</div>
            <div className="text-3xl font-black text-rose-600 mt-2">{metrics.overdueCount}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">Needs immediate attention</div>
          </div>
        </div>
      )}

      {metrics.role === 'DEPARTMENT_STAFF' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Department Queue</div>
            <div className="text-3xl font-black text-purple-700 mt-2">{metrics.queueCount}</div>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">Assigned to {user.dept_name} queue</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">In-Progress Tasks</div>
            <div className="text-3xl font-black text-blue-600 mt-2">{metrics.inProgressCount}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">Under active processing</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase">Overdue SLA</div>
            <div className="text-3xl font-black text-rose-600 mt-2">{metrics.overdueCount}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">Breached fulfillment SLA</div>
          </div>
        </div>
      )}

      {['OPERATIONS_MANAGER', 'SYSTEM_ADMIN', 'DEPARTMENT_HEAD'].includes(metrics.role) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Total Requests</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalRequests}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Open / Active</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{metrics.openRequests}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Pending Approval</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.pendingApprovals}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase">In-Progress</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{metrics.inProgressRequests}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Completed</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.completedRequests}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-700 uppercase">SLA Compliance</div>
            <div className="text-2xl font-black text-emerald-800 mt-1">{metrics.slaPerformancePercent}%</div>
          </div>
        </div>
      )}

      {/* Main Content Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Priority Work Items</span>
            </h2>
            <Link to="/requests" className="text-xs font-bold text-blue-600 hover:text-blue-700">View All →</Link>
          </div>

          {metrics.pendingApprovals?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {metrics.pendingApprovals.map(r => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 p-2 rounded-lg transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{r.request_number}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1">{r.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">By {r.requester_name} • {r.request_type_name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SlaBadge sla={r.sla} />
                    <Link
                      to={`/requests/${r.id}`}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No pending approval items requiring your immediate action.
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Request Volume by Category</span>
            </h3>
            {metrics.byCategory ? (
              <div className="space-y-2">
                {Object.entries(metrics.byCategory).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">{cat}</span>
                    <span className="font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400">Category data loaded</div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-500" />
              <span>Department Distribution</span>
            </h3>
            {metrics.byDepartment ? (
              <div className="space-y-2">
                {Object.entries(metrics.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">{dept}</span>
                    <span className="font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full text-[10px]">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400">Department distribution active</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
