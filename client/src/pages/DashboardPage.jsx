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
  FileText, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  Layers,
  Flame,
  ChevronRight,
  Sparkles,
  Activity,
  Plus,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

const CATEGORY_COLORS = ['#8b5cf6', '#6366f1', '#06b6d4', '#ec4899', '#f59e0b'];
const DEPT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#64748b'];

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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-purple-500/40 flex items-center justify-center mb-3 animate-bounce shadow-lg shadow-purple-500/20">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div className="font-mono text-xs text-purple-300 tracking-wider">
          SYNCHRONIZING_INTELLIGENCE_METRICS...
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const categoryChartData = Object.entries(metrics.byCategory || {}).map(([name, count]) => ({ name, count }));
  const deptChartData = Object.entries(metrics.byDepartment || {}).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans text-slate-100">
      
      {/* 1. Header: High-Tech Glassmorphic Title Spotlight */}
      <div className="relative overflow-hidden rounded-3xl p-6 glass-card border border-purple-500/30 shadow-2xl shadow-purple-950/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{user.role_name} Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
              Transform Operations Into Decisions
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Real-time operational dashboard monitoring SLA adherence, departmental request volumes, and active approval workflows.
            </p>
          </div>

          <div>
            <Link
              to="/requests/create"
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition flex items-center gap-2 border border-purple-400/30 ring-1 ring-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Request</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Critical Overdue Alert Banner */}
      {metrics.overdueCount > 0 && (
        <div className="rounded-2xl p-4 bg-rose-950/40 backdrop-blur-xl border border-rose-500/40 shadow-xl shadow-rose-950/50 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <span className="font-mono font-bold text-rose-300 uppercase mr-2">[CRITICAL_SLA_BREACH]</span>
              <span className="text-rose-200 font-medium">
                {metrics.overdueCount} request(s) exceeded target resolution SLA window.
              </span>
            </div>
          </div>
          <Link
            to="/requests?sla_status=OVERDUE"
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition shrink-0 ml-4"
          >
            RESOLVE NOW →
          </Link>
        </div>
      )}

      {/* 3. Glassmorphic KPI Cards Ribbon */}
      {['OPERATIONS_MANAGER', 'SYSTEM_ADMIN', 'DEPARTMENT_HEAD'].includes(metrics.role) ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-card p-4 rounded-2xl border border-purple-500/20 glass-card-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Total Volume</div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">{metrics.totalRequests}</div>
            <div className="text-[10px] text-purple-400/80 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>All Workflows</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-purple-500/20 glass-card-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Active Open</div>
            <div className="text-2xl font-mono font-extrabold text-purple-400 mt-1">{metrics.openRequests}</div>
            <div className="text-[10px] text-purple-300/80 mt-1 font-mono">In pipeline</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-amber-500/20 glass-card-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Pending Review</div>
            <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">{metrics.pendingApprovals}</div>
            <div className="text-[10px] text-amber-300/80 mt-1 font-mono">Awaiting action</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-cyan-500/20 glass-card-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Processing</div>
            <div className="text-2xl font-mono font-extrabold text-cyan-400 mt-1">{metrics.inProgressRequests}</div>
            <div className="text-[10px] text-cyan-300/80 mt-1 font-mono">Fulfillment</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 glass-card-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Completed</div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">{metrics.completedRequests}</div>
            <div className="text-[10px] text-emerald-300/80 mt-1 font-mono">Resolved</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-900/60 glass-card-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">SLA Target</div>
            <div className="text-2xl font-mono font-extrabold text-purple-300 mt-1">{metrics.slaPerformancePercent}%</div>
            <div className="text-[10px] text-purple-400/90 mt-1 flex items-center gap-1 font-mono">
              <Award className="w-3 h-3" />
              <span>Adherence</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-4 rounded-2xl border border-purple-500/20">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Active Requests</div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">{metrics.activeCount || metrics.teamTotalCount || metrics.queueCount}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-amber-500/20">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Action Required</div>
            <div className="text-2xl font-mono font-extrabold text-amber-400 mt-1">{metrics.actionRequiredCount || metrics.pendingApprovalsCount || metrics.inProgressCount}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-emerald-500/20">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Completed</div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">{metrics.completedCount || 0}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-rose-500/20">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Overdue SLA</div>
            <div className="text-2xl font-mono font-extrabold text-rose-400 mt-1">{metrics.overdueCount || 0}</div>
          </div>
        </div>
      )}

      {/* 4. Asymmetric Grid Layout (70% Left: Queue & Bar Chart / 30% Right: Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (70% Width): Priority Queue & Recharts Category Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Glass Priority Queue Table */}
          <div className="glass-card rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">PRIORITY_ACTION_ITEMS</h2>
              </div>
              <Link to="/requests" className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition">VIEW_ALL →</Link>
            </div>

            {metrics.pendingApprovals?.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">REQ_ID</th>
                    <th className="py-3 px-4">TITLE / WORKFLOW</th>
                    <th className="py-3 px-4">REQUESTER</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">SLA</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {metrics.pendingApprovals.map(r => (
                    <tr key={r.id} className="hover:bg-violet-950/20 transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">{r.request_number}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 truncate max-w-[200px]">{r.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.request_type_name}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300 font-medium">{r.requester_name}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 px-4"><SlaBadge sla={r.sla} /></td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/requests/${r.id}`}
                          className="px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-[10px] font-bold rounded-lg transition inline-block shadow-md shadow-violet-950/50 border border-purple-400/30"
                        >
                          EXECUTE
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">NO_PENDING_ACTION_ITEMS</div>
            )}
          </div>

          {/* Recharts Bar Chart: Volume by Category */}
          <div className="glass-card p-5 rounded-2xl border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <h2 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">REQUEST_VOLUME_BY_CATEGORY</h2>
              <span className="text-[10px] font-mono text-purple-400">LIVE_METRICS</span>
            </div>
            <div className="h-56 w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#e2e8f0' }} width={120} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0c0d14', borderColor: '#7c3aed', borderRadius: '12px', color: '#fff', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">NO_DATA</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (30% Width): Recharts Department Donut Chart */}
        <div className="space-y-6">
          
          <div className="glass-card p-5 rounded-2xl border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <h2 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">DEPARTMENT_ALLOCATION</h2>
            </div>
            <div className="h-56 w-full">
              {deptChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="count">
                      {deptChartData.map((entry, index) => (
                        <Cell key={`dept-cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0c0d14', borderColor: '#7c3aed', borderRadius: '12px', color: '#fff', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(val) => <span className="text-[10px] font-mono text-slate-300">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">NO_DATA</div>
              )}
            </div>
          </div>

          {/* Department Allocation Summary List */}
          <div className="glass-card p-4 rounded-2xl border border-purple-500/20 space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800/80 pb-2">
              DEPT_LOAD_SUMMARY
            </div>
            <div className="space-y-1.5">
              {deptChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-0">
                  <span className="font-semibold text-slate-200">{d.name}</span>
                  <span className="font-mono text-[11px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {d.count} req
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
