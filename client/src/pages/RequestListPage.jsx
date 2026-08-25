import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { Link, useSearchParams } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge';
import SlaBadge from '../components/common/SlaBadge';
import { Search, Plus, ChevronRight, FileText, Inbox, Layers } from 'lucide-react';

export default function RequestListPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('request_type_id') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || '');
  const [selectedSla, setSelectedSla] = useState(searchParams.get('sla_status') || '');
  const [scope, setScope] = useState(searchParams.get('scope') || 'all');

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [user, searchParams, scope, selectedType, selectedStatus, selectedPriority, selectedSla]);

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/types`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequestTypes(data.requestTypes || []);
      }
    } catch (err) {
      console.error('Fetch types error:', err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedType) params.set('request_type_id', selectedType);
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedPriority) params.set('priority', selectedPriority);
      if (selectedSla) params.set('sla_status', selectedSla);
      if (scope) params.set('scope', scope);

      const res = await fetch(`${API_BASE_URL}/api/requests?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-body text-slate-100 bg-grid-pattern">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F7931A] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>LEDGER_OPERATIONS / QUEUE</span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">Requests Central Queue</h1>
        </div>
        <Link
          to="/requests/create"
          className="px-5 py-2.5 bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] text-white font-heading font-bold text-xs rounded-full shadow-[0_0_25px_-5px_rgba(234,88,12,0.6)] hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 border border-white/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Scope Tabs & Filter Controls */}
      <div className="btc-card p-4 rounded-2xl space-y-4">
        
        {/* Scope Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <span className="text-[10px] font-mono font-bold text-[#F7931A] mr-2 uppercase tracking-widest">QUEUE_SCOPE:</span>
          {[
            { id: 'all', label: 'All Accessible' },
            { id: 'my_requests', label: 'My Submissions' },
            { id: 'pending_approval', label: 'Pending My Approval' },
            { id: 'dept_queue', label: 'Department Queue' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setScope(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                scope === tab.id
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-bold shadow-[0_0_15px_rgba(247,147,26,0.5)] border border-[#FFD600]/30'
                  : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Minimalist Technical Inputs */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search REQ #, title..."
              className="w-full pl-8 pr-3 py-2 bg-black/50 border-b-2 border-white/20 rounded-lg text-xs text-white placeholder:text-slate-500 focus-visible:border-[#F7931A] focus-visible:outline-none focus-visible:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)]"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border-b-2 border-white/20 rounded-lg text-xs text-white focus-visible:border-[#F7931A] focus-visible:outline-none"
          >
            <option value="" className="bg-[#0F1115]">All Workflow Types</option>
            {requestTypes.map(t => (
              <option key={t.id} value={t.id} className="bg-[#0F1115]">{t.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border-b-2 border-white/20 rounded-lg text-xs text-white focus-visible:border-[#F7931A] focus-visible:outline-none"
          >
            <option value="" className="bg-[#0F1115]">All Statuses</option>
            <option value="APPROVAL_PENDING" className="bg-[#0F1115]">Approval Pending</option>
            <option value="PROCESSING" className="bg-[#0F1115]">Processing</option>
            <option value="CHANGES_REQUESTED" className="bg-[#0F1115]">Changes Requested</option>
            <option value="APPROVED" className="bg-[#0F1115]">Approved</option>
            <option value="COMPLETED" className="bg-[#0F1115]">Completed</option>
            <option value="REJECTED" className="bg-[#0F1115]">Rejected</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border-b-2 border-white/20 rounded-lg text-xs text-white focus-visible:border-[#F7931A] focus-visible:outline-none"
          >
            <option value="" className="bg-[#0F1115]">All Priorities</option>
            <option value="LOW" className="bg-[#0F1115]">Low</option>
            <option value="MEDIUM" className="bg-[#0F1115]">Medium</option>
            <option value="HIGH" className="bg-[#0F1115]">High</option>
            <option value="URGENT" className="bg-[#0F1115]">Urgent</option>
          </select>

          <select
            value={selectedSla}
            onChange={(e) => setSelectedSla(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border-b-2 border-white/20 rounded-lg text-xs text-white focus-visible:border-[#F7931A] focus-visible:outline-none"
          >
            <option value="" className="bg-[#0F1115]">All SLA States</option>
            <option value="WITHIN_SLA" className="bg-[#0F1115]">Within SLA</option>
            <option value="APPROACHING_SLA" className="bg-[#0F1115]">Approaching SLA</option>
            <option value="OVERDUE" className="bg-[#0F1115]">Overdue</option>
            <option value="COMPLETED_WITHIN_SLA" className="bg-[#0F1115]">Completed within SLA</option>
            <option value="COMPLETED_AFTER_SLA" className="bg-[#0F1115]">Completed Overdue</option>
          </select>

        </form>

      </div>

      {/* Requests Table */}
      <div className="btc-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[#FFD600]">QUERYING_BITCOIN_LEDGER...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h3 className="text-xs font-heading font-bold text-white uppercase">No matching requests found</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">TRY_ADJUSTING_FILTER_PARAMETERS</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#030304] border-b border-white/10 text-slate-400 font-mono text-[9px] font-bold uppercase tracking-widest">
                  <th className="py-3 px-4">REQ_ID</th>
                  <th className="py-3 px-4">TITLE / TYPE</th>
                  <th className="py-3 px-4">REQUESTER</th>
                  <th className="py-3 px-4">STAGE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-body">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-[#F7931A]/10 transition">
                    
                    <td className="py-3 px-4 font-mono font-bold text-[#F7931A]">
                      {r.request_number}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-heading font-bold text-white truncate">{r.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.request_type_name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{r.requester_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.requester_dept_name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-300">{r.stage_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono capitalize">{r.assigned_role_code.replace('_', ' ')}</div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="py-3 px-4">
                      <SlaBadge sla={r.sla} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/requests/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-mono text-[10px] font-bold shadow-[0_0_15px_rgba(247,147,26,0.4)] hover:scale-105 transition"
                      >
                        <span>EXECUTE</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
