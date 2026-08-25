import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { Link, useSearchParams } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge';
import SlaBadge from '../components/common/SlaBadge';
import { Search, Filter, Plus, ChevronRight, FileText, Inbox, Sparkles } from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-0.5">
            <Inbox className="w-4 h-4 text-purple-400" />
            <span>OPERATIONAL QUEUE MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
            Central Requests Queue
          </h1>
        </div>
        <Link
          to="/requests/create"
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 inline-flex items-center gap-2 border border-purple-400/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Scope Tabs & Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-purple-500/20 shadow-2xl space-y-4">
        
        {/* Scope Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
          <span className="text-[10px] font-mono font-bold text-purple-400 mr-2 uppercase tracking-wider">QUEUE_SCOPE:</span>
          {[
            { id: 'all', label: 'All Accessible' },
            { id: 'my_requests', label: 'My Submissions' },
            { id: 'pending_approval', label: 'Pending My Approval' },
            { id: 'dept_queue', label: 'Department Queue' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setScope(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs transition font-sans ${
                scope === tab.id
                  ? 'bg-gradient-to-r from-violet-600/40 to-indigo-600/40 text-purple-200 font-bold border border-purple-500/50 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-violet-950/20 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters Grid */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search REQ #, title..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Workflow Types</option>
            {requestTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="APPROVAL_PENDING">Approval Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={selectedSla}
            onChange={(e) => setSelectedSla(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All SLA States</option>
            <option value="WITHIN_SLA">Within SLA</option>
            <option value="APPROACHING_SLA">Approaching SLA</option>
            <option value="OVERDUE">Overdue</option>
            <option value="COMPLETED_WITHIN_SLA">Completed within SLA</option>
            <option value="COMPLETED_AFTER_SLA">Completed Overdue</option>
          </select>

        </form>

      </div>

      {/* Requests Data Table */}
      <div className="glass-card rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-xs font-mono text-purple-300">FILTERING_QUEUE_DATA...</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-8 h-8 text-purple-400/60 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-200">No matching requests found</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1">TRY_ADJUSTING_SEARCH_FILTERS</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">REQ_ID</th>
                  <th className="py-3 px-4">TITLE / TYPE</th>
                  <th className="py-3 px-4">REQUESTER</th>
                  <th className="py-3 px-4">STAGE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-violet-950/20 transition">
                    
                    <td className="py-3 px-4 font-mono font-bold text-purple-300">
                      {r.request_number}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100 truncate">{r.title}</div>
                      <div className="text-[10px] text-slate-400">{r.request_type_name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{r.requester_name}</div>
                      <div className="text-[10px] text-slate-400">{r.requester_dept_name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-300">{r.stage_name}</div>
                      <div className="text-[10px] text-purple-400/80 capitalize">{r.assigned_role_code.replace('_', ' ')}</div>
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-[10px] font-bold transition shadow-md shadow-violet-950/40 border border-purple-400/30"
                      >
                        <span>VIEW</span>
                        <ChevronRight className="w-3 h-3" />
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
