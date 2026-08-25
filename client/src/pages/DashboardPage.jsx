import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge';
import SlaBadge from '../components/common/SlaBadge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  Flame, 
  Activity, 
  Plus, 
  TrendingUp, 
  Award,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';

const CATEGORY_COLORS = ['#0f766e', '#334155', '#475569', '#64748b', '#94a3b8'];
const DEPT_COLORS = ['#0f766e', '#334155', '#b45309', '#0369a1', '#e11d48', '#64748b'];

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <Activity className="w-6 h-6 text-teal-700 animate-spin mb-2" />
        <div className="font-mono text-xs text-slate-500 font-bold">
          LOADING_OPERATIONAL_COMMAND_CENTER...
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const categoryChartData = Object.entries(metrics.byCategory || {}).map(([name, count]) => ({ name, count }));
  const deptChartData = Object.entries(metrics.byDepartment || {}).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-4 w-full font-sans text-slate-900">
      
      {/* 1. Technical Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-0.5">
            <span className="text-slate-900 font-bold">{user.role_name} Scope</span>
            <span>•</span>
            <span>{user.dept_name} Department</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operations Command Console</h1>
        </div>

        <div>
          {/* Single Deep Teal Primary Action Button */}
          <Link
            to="/requests/create"
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-md shadow-2xs transition flex items-center gap-1.5 focus-ring"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Request</span>
          </Link>
        </div>
      </div>

      {/* 2. Critical Overdue SLA Alert Callout (Left Border Accent) */}
      {metrics.overdueCount > 0 && (
        <div className="border-l-4 border-rose-600 bg-rose-50 p-3 rounded-r-md border-y border-r border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <Flame className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold text-rose-950">URGENT SLA BREACH:</span>
            <span className="text-rose-900 font-medium">
              {metrics.overdueCount} request(s) exceeded target resolution SLA window.
            </span>
          </div>
          <Link
            to="/requests?sla_status=OVERDUE"
            className="text-xs font-mono font-bold text-rose-700 hover:text-rose-950 underline shrink-0 ml-4"
          >
            RESOLVE NOW →
          </Link>
        </div>
      )}

      {/* 3. High-Density Metric Ribbon (Mono Numbers Only) */}
      {['OPERATIONS_MANAGER', 'SYSTEM_ADMIN', 'DEPARTMENT_HEAD'].includes(metrics.role) ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Volume</div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">{metrics.totalRequests}</div>
          </div>
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Open</div>
            <div className="text-2xl font-mono font-bold text-teal-800 mt-0.5">{metrics.openRequests}</div>
          </div>
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Review</div>
            <div className="text-2xl font-mono font-bold text-amber-700 mt-0.5">{metrics.pendingApprovals}</div>
          </div>
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Processing</div>
            <div className="text-2xl font-mono font-bold text-slate-700 mt-0.5">{metrics.inProgressRequests}</div>
          </div>
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</div>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-0.5">{metrics.completedRequests}</div>
          </div>
          <div className="bg-slate-100 p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">SLA Adherence</div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">{metrics.slaPerformancePercent}%</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Requests</div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">{metrics.activeCount || metrics.teamTotalCount || metrics.queueCount}</div>
          </div>
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Required</div>
            <div className="text-2xl font-mono font-bold text-amber-700 mt-0.5">{metrics.actionRequiredCount || metrics.pendingApprovalsCount || metrics.inProgressCount}</div>
          </div>
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</div>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-0.5">{metrics.completedCount || 0}</div>
          </div>
          <div className="bg-white p-3 rounded-xs border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overdue SLA</div>
            <div className="text-2xl font-mono font-bold text-rose-700 mt-0.5">{metrics.overdueCount || 0}</div>
          </div>
        </div>
      )}

      {/* 4. Asymmetric 70/30 Grid (70% Primary Focus Queue & Bar Chart / 30% Secondary Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column (70% Primary Focus): Priority Queue Table & Category Bar Chart */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Priority Work Queue (Dark Slate Table Header, Compact Rows) */}
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">PRIORITY_WORK_QUEUE</span>
              <Link to="/requests" className="text-[10px] font-mono text-slate-400 hover:text-white transition">VIEW_ALL_QUEUE →</Link>
            </div>

            {metrics.pendingApprovals?.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-3">REQ_ID</th>
                    <th className="py-2 px-3">TITLE / WORKFLOW</th>
                    <th className="py-2 px-3">REQUESTER</th>
                    <th className="py-2 px-3">STATUS</th>
                    <th className="py-2 px-3">SLA</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {metrics.pendingApprovals.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-1.5 px-3 font-mono text-xs font-bold text-slate-900">{r.request_number}</td>
                      <td className="py-1.5 px-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[190px]">{r.title}</div>
                        <div className="text-[10px] text-slate-500">{r.request_type_name}</div>
                      </td>
                      <td className="py-1.5 px-3 text-[11px] text-slate-700 font-medium">{r.requester_name}</td>
                      <td className="py-1.5 px-3"><StatusBadge status={r.status} /></td>
                      <td className="py-1.5 px-3"><SlaBadge sla={r.sla} /></td>
                      <td className="py-1.5 px-3 text-right">
                        <Link
                          to={`/requests/${r.id}`}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-bold rounded-xs transition inline-block focus-ring"
                        >
                          EXECUTE
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-mono">NO_PENDING_ACTION_ITEMS</div>
            )}
          </div>

          {/* Recharts Bar Chart: Request Volume by Category */}
          <div className="bg-white p-4 rounded-md border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                <span>Request Volume by Category</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">REALTIME_METRICS</span>
            </div>
            <div className="h-48 w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#0f172a' }} width={120} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '4px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={14}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">NO_DATA</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (30% Focus): Recharts Department Donut Chart */}
        <div className="space-y-4">
          
          <div className="bg-white p-4 rounded-md border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Department Allocation</h2>
            </div>
            <div className="h-48 w-full">
              {deptChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="count">
                      {deptChartData.map((entry, index) => (
                        <Cell key={`dept-cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '4px', color: '#fff', fontSize: '11px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(val) => <span className="text-[10px] text-slate-700 font-semibold">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">NO_DATA</div>
              )}
            </div>
          </div>

          {/* Department Load Summary */}
          <div className="bg-white p-3.5 rounded-md border border-slate-200 space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
              DEPT_LOAD_SUMMARY
            </div>
            <div className="space-y-1">
              {deptChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <span className="font-semibold text-slate-800">{d.name}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200">{d.count} req</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
