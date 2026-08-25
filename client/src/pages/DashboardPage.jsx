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
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  BarChart2, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  Layers,
  Flame,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const DEPT_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading operational metrics & chart engine...</span>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Format Recharts dataset for Category Volume
  const categoryChartData = Object.entries(metrics.byCategory || {}).map(([name, count]) => ({
    name,
    count
  }));

  // Format Recharts dataset for Department Distribution
  const deptChartData = Object.entries(metrics.byDepartment || {}).map(([name, count]) => ({
    name,
    count
  }));

  const overdueList = metrics.pendingApprovals?.filter(r => r.sla?.isOverdue || r.sla?.code === 'OVERDUE') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      
      {/* 1. Restrained Executive Title Block (Replaces blue gradient hero banner) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-md">
              {user.role_name} Scope
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">{user.dept_name} Department</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Operations Command Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/requests/create"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <span>Create New Request</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Elevated SLA Overdue Alert Card (High Visual Weight for SLA Breaches) */}
      {metrics.overdueCount > 0 && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Urgent SLA Breach Warning</h3>
                <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full">{metrics.overdueCount} Overdue</span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5 font-medium">
                {metrics.overdueCount} request(s) have exceeded target SLA resolution windows. Immediate action required.
              </p>
            </div>
          </div>
          <Link
            to="/requests?sla_status=OVERDUE"
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shadow-xs shrink-0 flex items-center gap-1"
          >
            <span>Filter Overdue Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Metric KPI Cards (Restrained Typography & Tight Spacing) */}
      {['OPERATIONS_MANAGER', 'SYSTEM_ADMIN', 'DEPARTMENT_HEAD'].includes(metrics.role) ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Volume</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalRequests}</div>
            <span className="text-[10px] text-slate-500 font-medium">System requests</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active / Open</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.openRequests}</div>
            <span className="text-[10px] text-indigo-600 font-medium">In pipeline</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.pendingApprovals}</div>
            <span className="text-[10px] text-amber-600 font-medium">Awaiting decision</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Processing</span>
            <div className="text-2xl font-black text-purple-600 mt-1">{metrics.inProgressRequests}</div>
            <span className="text-[10px] text-purple-600 font-medium">Department queue</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.completedRequests}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Fulfilled</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">SLA Compliance</span>
            <div className="text-2xl font-black text-emerald-800 mt-1">{metrics.slaPerformancePercent}%</div>
            <span className="text-[10px] text-emerald-700 font-medium">Target resolution rate</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Requests</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.activeCount || metrics.teamTotalCount || metrics.queueCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">In workflow pipeline</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Required</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.actionRequiredCount || metrics.pendingApprovalsCount || metrics.inProgressCount}</div>
            <span className="text-[10px] text-amber-600 font-medium">Pending input/approval</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.completedCount || 0}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Fulfilled items</span>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs ${
            (metrics.overdueCount || 0) > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200/80'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              (metrics.overdueCount || 0) > 0 ? 'text-rose-700' : 'text-slate-400'
            }`}>SLA Overdue</span>
            <div className={`text-2xl font-black mt-1 ${
              (metrics.overdueCount || 0) > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}>{metrics.overdueCount || 0}</div>
            <span className={`text-[10px] font-medium ${
              (metrics.overdueCount || 0) > 0 ? 'text-rose-600' : 'text-slate-500'
            }`}>Breached SLA limit</span>
          </div>
        </div>
      )}

      {/* 4. REAL LIVE RECHARTS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recharts Chart 1: Request Volume by Category (Horizontal Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Request Volume by Category</h2>
            </div>
            <span className="text-[10px] font-medium text-slate-400">Live Breakdown</span>
          </div>

          <div className="h-64 w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No category data available</div>
            )}
          </div>
        </div>

        {/* Recharts Chart 2: Department Distribution (Donut / Pie Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Department Distribution</h2>
            </div>
            <span className="text-[10px] font-medium text-slate-400">Live Allocation</span>
          </div>

          <div className="h-64 w-full">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {deptChartData.map((entry, index) => (
                      <Cell key={`dept-cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No department distribution data</div>
            )}
          </div>
        </div>

      </div>

      {/* 5. Work Queue Table (Restrained Table Design & Clear SLA Badges) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Priority Work Queue Items</h2>
          </div>
          <Link to="/requests" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <span>View All Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {metrics.pendingApprovals?.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {metrics.pendingApprovals.map(r => (
              <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-lg transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">{r.request_number}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-xs font-semibold text-slate-900">{r.title}</div>
                  <div className="text-[10px] text-slate-400">
                    Submitted by <strong className="text-slate-600">{r.requester_name}</strong> • {r.request_type_name}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <SlaBadge sla={r.sla} />
                  <Link
                    to={`/requests/${r.id}`}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No pending action items requiring immediate review.
          </div>
        )}
      </div>

    </div>
  );
}
