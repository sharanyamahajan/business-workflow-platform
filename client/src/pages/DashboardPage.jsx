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
  Sparkles
} from 'lucide-react';

const CATEGORY_COLORS = ['#6C63FF', '#38B2AC', '#DD6B20', '#3182CE', '#805AD5'];
const DEPT_COLORS = ['#6C63FF', '#38B2AC', '#DD6B20', '#3182CE', '#E53E3E', '#718096'];

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
        <div className="w-12 h-12 rounded-full neu-inset-deep flex items-center justify-center mb-3 text-[#6C63FF]">
          <Activity className="w-6 h-6 animate-spin" />
        </div>
        <div className="font-mono text-xs text-[#6B7280] font-bold uppercase">
          MOLDING_NEUMORPHIC_DASHBOARD...
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const categoryChartData = Object.entries(metrics.byCategory || {}).map(([name, count]) => ({ name, count }));
  const deptChartData = Object.entries(metrics.byDepartment || {}).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-body text-[#3D4852]">
      
      {/* 1. Header Bar: Elevated Tactile Container */}
      <div className="p-6 rounded-[32px] neu-extruded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6C63FF] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPERATIONS_COMMAND</span>
            <span>•</span>
            <span className="text-[#3D4852]">{user.role_name}</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-[#3D4852] tracking-tight">Operations Command Console</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">Real-time workflow execution, SLA target monitoring & queue metrics</p>
        </div>

        <div>
          <Link
            to="/requests/create"
            className="px-5 py-2.5 neu-button-primary text-white font-display font-bold text-xs rounded-2xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Request</span>
          </Link>
        </div>
      </div>

      {/* 2. Critical Overdue Callout (Carved Inset Well) */}
      {metrics.overdueCount > 0 && (
        <div className="p-4 rounded-3xl neu-inset text-[#E53E3E] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-2xl neu-inset-deep flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-[#E53E3E]" />
            </div>
            <div>
              <span className="font-mono font-bold uppercase tracking-wider mr-2">[CRITICAL_SLA_BREACH]</span>
              <span className="font-medium text-[#3D4852]">
                {metrics.overdueCount} request(s) exceeded target resolution SLA limit.
              </span>
            </div>
          </div>
          <Link
            to="/requests?sla_status=OVERDUE"
            className="text-xs font-display font-bold px-4 py-1.5 rounded-2xl neu-button-secondary text-[#E53E3E] shrink-0 ml-4"
          >
            RESOLVE NOW →
          </Link>
        </div>
      )}

      {/* 3. Neumorphic KPI Cards Ribbon */}
      {['OPERATIONS_MANAGER', 'SYSTEM_ADMIN', 'DEPARTMENT_HEAD'].includes(metrics.role) ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-3xl neu-extruded neu-extruded-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Total Volume</div>
            <div className="text-2xl font-display font-extrabold text-[#3D4852] mt-1">{metrics.totalRequests}</div>
            <div className="text-[10px] text-[#6C63FF] font-mono font-bold mt-1">+10.5% active</div>
          </div>

          <div className="p-5 rounded-3xl neu-extruded neu-extruded-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Active Open</div>
            <div className="text-2xl font-display font-extrabold text-[#6C63FF] mt-1">{metrics.openRequests}</div>
            <div className="text-[10px] text-[#6B7280] font-mono mt-1">In pipeline</div>
          </div>

          <div className="p-5 rounded-3xl neu-extruded neu-extruded-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Pending Review</div>
            <div className="text-2xl font-display font-extrabold text-[#DD6B20] mt-1">{metrics.pendingApprovals}</div>
            <div className="text-[10px] text-[#DD6B20] font-mono mt-1">Action needed</div>
          </div>

          <div className="p-5 rounded-3xl neu-extruded neu-extruded-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Processing</div>
            <div className="text-2xl font-display font-extrabold text-[#38B2AC] mt-1">{metrics.inProgressRequests}</div>
            <div className="text-[10px] text-[#38B2AC] font-mono mt-1">Fulfillment</div>
          </div>

          <div className="p-5 rounded-3xl neu-extruded neu-extruded-hover">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Completed</div>
            <div className="text-2xl font-display font-extrabold text-[#38B2AC] mt-1">{metrics.completedRequests}</div>
            <div className="text-[10px] text-[#38B2AC] font-mono font-bold mt-1">Target met</div>
          </div>

          <div className="p-5 rounded-3xl neu-inset">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">SLA Adherence</div>
            <div className="text-2xl font-display font-extrabold text-[#6C63FF] mt-1">{metrics.slaPerformancePercent}%</div>
            <div className="text-[10px] text-[#38B2AC] font-mono font-bold mt-1">Compliant</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl neu-extruded">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Active Requests</div>
            <div className="text-2xl font-display font-extrabold text-[#3D4852] mt-1">{metrics.activeCount || metrics.teamTotalCount || metrics.queueCount}</div>
          </div>
          <div className="p-5 rounded-3xl neu-extruded">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Action Required</div>
            <div className="text-2xl font-display font-extrabold text-[#DD6B20] mt-1">{metrics.actionRequiredCount || metrics.pendingApprovalsCount || metrics.inProgressCount}</div>
          </div>
          <div className="p-5 rounded-3xl neu-extruded">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Completed</div>
            <div className="text-2xl font-display font-extrabold text-[#38B2AC] mt-1">{metrics.completedCount || 0}</div>
          </div>
          <div className="p-5 rounded-3xl neu-extruded">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">Overdue SLA</div>
            <div className="text-2xl font-display font-extrabold text-[#E53E3E] mt-1">{metrics.overdueCount || 0}</div>
          </div>
        </div>
      )}

      {/* 4. Asymmetric Grid Layout (70% Left: Queue & Bar Chart / 30% Right: Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (70% Focus): Priority Work Queue & Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Priority Queue Table */}
          <div className="p-6 rounded-[32px] neu-extruded space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#6B7280]/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF] shrink-0"></span>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D4852]">PRIORITY_WORK_QUEUE</h2>
              </div>
              <Link to="/requests" className="text-[10px] font-mono text-[#6C63FF] font-bold hover:underline">VIEW_ALL →</Link>
            </div>

            {metrics.pendingApprovals?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[#6B7280] font-mono text-[9px] font-bold uppercase tracking-wider border-b border-[#6B7280]/20">
                      <th className="py-2.5 px-3">REQ_ID</th>
                      <th className="py-2.5 px-3">TITLE / WORKFLOW</th>
                      <th className="py-2.5 px-3">REQUESTER</th>
                      <th className="py-2.5 px-3">STATUS</th>
                      <th className="py-2.5 px-3">SLA</th>
                      <th className="py-2.5 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#6B7280]/10 font-body">
                    {metrics.pendingApprovals.map(r => (
                      <tr key={r.id} className="hover:bg-[#E0E5EC]/80 transition">
                        <td className="py-3 px-3 font-mono font-bold text-[#6C63FF]">{r.request_number}</td>
                        <td className="py-3 px-3">
                          <div className="font-display font-bold text-[#3D4852] truncate max-w-[190px]">{r.title}</div>
                          <div className="text-[10px] text-[#6B7280] font-mono">{r.request_type_name}</div>
                        </td>
                        <td className="py-3 px-3 text-xs text-[#3D4852] font-medium">{r.requester_name}</td>
                        <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                        <td className="py-3 px-3"><SlaBadge sla={r.sla} /></td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/requests/${r.id}`}
                            className="px-3 py-1.5 neu-button-primary text-white font-mono text-[10px] font-bold rounded-xl inline-block"
                          >
                            EXECUTE
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#6B7280] font-mono">NO_PENDING_ACTION_ITEMS</div>
            )}
          </div>

          {/* Recharts Bar Chart: Request Volume by Category */}
          <div className="p-6 rounded-[32px] neu-extruded space-y-4">
            <div className="flex items-center justify-between border-b border-[#6B7280]/20 pb-3">
              <h2 className="text-xs font-mono font-bold text-[#3D4852] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#6C63FF]" />
                <span>REQUEST_VOLUME_BY_CATEGORY</span>
              </h2>
              <span className="text-[10px] font-mono text-[#6C63FF]">LIVE_METRICS</span>
            </div>
            <div className="h-56 w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#3D4852' }} width={130} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#E0E5EC', borderColor: 'transparent', borderRadius: '16px', boxShadow: '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.6)', color: '#3D4852', fontSize: '11px' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#6B7280] font-mono">NO_DATA</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (30% Focus): Recharts Department Donut Chart */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-[32px] neu-extruded space-y-4">
            <div className="flex items-center justify-between border-b border-[#6B7280]/20 pb-3">
              <h2 className="text-xs font-mono font-bold text-[#3D4852] uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#6C63FF]" />
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
                    <Tooltip contentStyle={{ backgroundColor: '#E0E5EC', borderColor: 'transparent', borderRadius: '16px', boxShadow: '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.6)', color: '#3D4852', fontSize: '11px' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(val) => <span className="text-[10px] font-mono text-[#3D4852]">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#6B7280] font-mono">NO_DATA</div>
              )}
            </div>
          </div>

          {/* Department Load Summary */}
          <div className="p-5 rounded-3xl neu-inset space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF] border-b border-[#6B7280]/20 pb-2">
              DEPT_LOAD_SUMMARY
            </div>
            <div className="space-y-1.5 font-body">
              {deptChartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs py-1.5 border-b border-[#6B7280]/10 last:border-0">
                  <span className="font-semibold text-[#3D4852]">{d.name}</span>
                  <span className="font-mono text-[11px] font-bold text-[#6C63FF] neu-inset-sm px-2.5 py-0.5 rounded-full">
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
