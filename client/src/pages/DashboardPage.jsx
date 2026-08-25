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
  PieChart as PieIcon,
  Zap,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

const CATEGORY_COLORS = ['#F7931A', '#EA580C', '#FFD600', '#06b6d4', '#ec4899'];
const DEPT_COLORS = ['#F7931A', '#FFD600', '#EA580C', '#10b981', '#06b6d4', '#64748b'];

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
        <div className="w-12 h-12 rounded-full bg-[#F7931A]/20 border border-[#F7931A]/50 flex items-center justify-center mb-3 animate-spin shadow-[0_0_25px_rgba(247,147,26,0.5)]">
          <Zap className="w-6 h-6 text-[#F7931A]" />
        </div>
        <div className="font-mono text-xs text-[#FFD600] tracking-widest uppercase">
          SYNCHRONIZING_BITCOIN_LEDGER_METRICS...
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const categoryChartData = Object.entries(metrics.byCategory || {}).map(([name, count]) => ({ name, count }));
  const deptChartData = Object.entries(metrics.byDepartment || {}).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-body text-slate-100 bg-grid-pattern">
      
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 btc-card border border-white/10 shadow-[0_0_50px_-10px_rgba(247,147,26,0.15)]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#F7931A] opacity-10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-[#EA580C] opacity-10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#FFD600] text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5 text-[#F7931A]" />
              <span>{user.role_name} Node Scope</span>
              <span>•</span>
              <span>{user.dept_name}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
              Bitcoin DeFi <span className="text-gradient-btc">Workflow Engine</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Cryptographic SLA monitoring, automated multi-stage approvals, and immutable ledger execution.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/requests/create"
              className="px-6 py-3 bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] text-white font-heading font-bold text-xs rounded-full shadow-[0_0_25px_-5px_rgba(234,88,12,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Request</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Critical Overdue SLA Callout */}
      {metrics.overdueCount > 0 && (
        <div className="rounded-2xl p-4 bg-rose-950/40 backdrop-blur-xl border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <span className="font-mono font-bold text-rose-300 uppercase tracking-wider mr-2">[CRITICAL_SLA_BREACH]</span>
              <span className="text-rose-200 font-medium">
                {metrics.overdueCount} request(s) exceeded target resolution SLA window.
              </span>
            </div>
          </div>
          <Link
            to="/requests?sla_status=OVERDUE"
            className="text-xs font-mono font-bold px-4 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition shrink-0 ml-4 shadow-md"
          >
            RESOLVE NOW →
          </Link>
        </div>
      )}

      {/* 3. Bitcoin Fire KPI Metric Ribbon */}
      {['OPERATIONS_MANAGER', 'SYSTEM_ADMIN', 'DEPARTMENT_HEAD'].includes(metrics.role) ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="btc-card p-4 rounded-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Total Volume</div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">{metrics.totalRequests}</div>
            <div className="text-[10px] text-[#F7931A] font-mono mt-1 font-bold">+12.4% active</div>
          </div>

          <div className="btc-card p-4 rounded-2xl border-[#F7931A]/30">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F7931A]">Active Open</div>
            <div className="text-2xl font-mono font-extrabold text-[#F7931A] mt-1">{metrics.openRequests}</div>
            <div className="text-[10px] text-[#FFD600] font-mono mt-1">In pipeline</div>
          </div>

          <div className="btc-card p-4 rounded-2xl border-[#FFD600]/30">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFD600]">Pending Review</div>
            <div className="text-2xl font-mono font-extrabold text-[#FFD600] mt-1">{metrics.pendingApprovals}</div>
            <div className="text-[10px] text-amber-300 font-mono mt-1">Awaiting action</div>
          </div>

          <div className="btc-card p-4 rounded-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Processing</div>
            <div className="text-2xl font-mono font-extrabold text-cyan-400 mt-1">{metrics.inProgressRequests}</div>
            <div className="text-[10px] text-cyan-300 font-mono mt-1">Fulfillment</div>
          </div>

          <div className="btc-card p-4 rounded-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Completed</div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">{metrics.completedRequests}</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">100% verified</div>
          </div>

          <div className="btc-card p-4 rounded-2xl bg-gradient-to-br from-[#EA580C]/20 to-[#0F1115] border-[#F7931A]/40">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFD600]">SLA Target</div>
            <div className="text-2xl font-mono font-extrabold text-[#FFD600] mt-1">{metrics.slaPerformancePercent}%</div>
            <div className="text-[10px] text-[#F7931A] font-mono mt-1 flex items-center gap-1 font-bold">
              <Award className="w-3 h-3" />
              <span>Adherence</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="btc-card p-4 rounded-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Active Requests</div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">{metrics.activeCount || metrics.teamTotalCount || metrics.queueCount}</div>
          </div>
          <div className="btc-card p-4 rounded-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFD600]">Action Required</div>
            <div className="text-2xl font-mono font-extrabold text-[#FFD600] mt-1">{metrics.actionRequiredCount || metrics.pendingApprovalsCount || metrics.inProgressCount}</div>
          </div>
          <div className="btc-card p-4 rounded-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Completed</div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">{metrics.completedCount || 0}</div>
          </div>
          <div className="btc-card p-4 rounded-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Overdue SLA</div>
            <div className="text-2xl font-mono font-extrabold text-rose-400 mt-1">{metrics.overdueCount || 0}</div>
          </div>
        </div>
      )}

      {/* 4. Asymmetric Grid Layout (70% Left: Queue & Recharts Bar / 30% Right: Recharts Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (70% Focus): Priority Work Queue & Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Priority Queue Table */}
          <div className="btc-card rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-[#030304]/90 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F7931A] shadow-[0_0_10px_#F7931A]"></span>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white">PRIORITY_WORK_QUEUE</h2>
              </div>
              <Link to="/requests" className="text-[10px] font-mono text-[#F7931A] hover:text-[#FFD600] transition">VIEW_ALL_QUEUE →</Link>
            </div>

            {metrics.pendingApprovals?.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#08080d] border-b border-white/10 text-slate-400 font-mono text-[9px] font-bold uppercase tracking-widest">
                    <th className="py-3 px-4">REQ_ID</th>
                    <th className="py-3 px-4">TITLE / WORKFLOW</th>
                    <th className="py-3 px-4">REQUESTER</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">SLA</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-body">
                  {metrics.pendingApprovals.map(r => (
                    <tr key={r.id} className="hover:bg-[#F7931A]/10 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#F7931A]">{r.request_number}</td>
                      <td className="py-3 px-4">
                        <div className="font-heading font-bold text-white truncate max-w-[200px]">{r.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.request_type_name}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300 font-medium">{r.requester_name}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 px-4"><SlaBadge sla={r.sla} /></td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/requests/${r.id}`}
                          className="px-3 py-1 bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-mono text-[10px] font-bold rounded-full transition inline-block shadow-[0_0_15px_rgba(247,147,26,0.4)] hover:scale-105"
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

          {/* Recharts Bar Chart: Request Volume by Category */}
          <div className="btc-card p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#F7931A]" />
                <span>REQUEST_VOLUME_BY_CATEGORY</span>
              </h2>
              <span className="text-[10px] font-mono text-[#FFD600]">LIVE_LEDGER_DATA</span>
            </div>
            <div className="h-56 w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#ffffff' }} width={130} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#030304', borderColor: '#F7931A', borderRadius: '12px', color: '#fff', fontSize: '11px', boxShadow: '0 0 25px rgba(247,147,26,0.4)' }} />
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

        {/* Right Column (30% Focus): Recharts Department Donut Chart */}
        <div className="space-y-6">
          
          <div className="btc-card p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#F7931A]" />
                <span>DEPARTMENT_ALLOCATION</span>
              </h2>
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
                    <Tooltip contentStyle={{ backgroundColor: '#030304', borderColor: '#F7931A', borderRadius: '12px', color: '#fff', fontSize: '11px', boxShadow: '0 0 25px rgba(247,147,26,0.4)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(val) => <span className="text-[10px] font-mono text-slate-300">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">NO_DATA</div>
              )}
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="btc-card p-4 rounded-2xl space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F7931A] border-b border-white/10 pb-2">
              DEPT_LOAD_SUMMARY
            </div>
            <div className="space-y-1.5 font-body">
              {deptChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <span className="font-semibold text-slate-200">{d.name}</span>
                  <span className="font-mono text-[11px] font-bold text-[#FFD600] bg-[#F7931A]/10 px-2.5 py-0.5 rounded-full border border-[#F7931A]/30">
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
