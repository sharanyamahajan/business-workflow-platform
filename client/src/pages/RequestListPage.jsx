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
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-body text-[#3D4852]">
      
      {/* Header Bar */}
      <div className="p-6 rounded-[32px] neu-extruded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6C63FF] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>QUEUE_OPERATIONS</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-[#3D4852] tracking-tight">Requests Central Queue</h1>
        </div>
        <Link
          to="/requests/create"
          className="px-5 py-2.5 neu-button-primary text-white font-display font-bold text-xs rounded-2xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Scope Tabs & Filter Controls */}
      <div className="p-6 rounded-[32px] neu-extruded space-y-4">
        
        {/* Scope Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#6B7280]/20 pb-3">
          <span className="text-[10px] font-mono font-bold text-[#6C63FF] mr-2 uppercase tracking-wider">QUEUE_SCOPE:</span>
          {[
            { id: 'all', label: 'All Accessible' },
            { id: 'my_requests', label: 'My Submissions' },
            { id: 'pending_approval', label: 'Pending My Approval' },
            { id: 'dept_queue', label: 'Department Queue' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setScope(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-body transition ${
                scope === tab.id
                  ? 'neu-inset text-[#6C63FF] font-bold'
                  : 'neu-button-secondary text-[#6B7280]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deep Inset Inputs */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search REQ #, title..."
              className="w-full pl-9 pr-3 py-2 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] font-medium neu-focus-ring"
          >
            <option value="">All Workflow Types</option>
            {requestTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] font-medium neu-focus-ring"
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
            className="w-full px-3 py-2 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] font-medium neu-focus-ring"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent Priority</option>
          </select>

          <select
            value={selectedSla}
            onChange={(e) => setSelectedSla(e.target.value)}
            className="w-full px-3 py-2 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] font-medium neu-focus-ring"
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

      {/* Data Table Container */}
      <div className="p-6 rounded-[32px] neu-extruded">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[#6C63FF]">QUERYING_OPERATIONAL_DATA...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
            <h3 className="text-xs font-display font-bold text-[#3D4852] uppercase">No matching requests found</h3>
            <p className="text-[10px] text-[#6B7280] font-mono mt-0.5">TRY_ADJUSTING_FILTER_PARAMETERS</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[#6B7280] font-mono text-[9px] font-bold uppercase tracking-wider border-b border-[#6B7280]/20">
                  <th className="py-3 px-3">REQ_ID</th>
                  <th className="py-3 px-3">TITLE / TYPE</th>
                  <th className="py-3 px-3">REQUESTER</th>
                  <th className="py-3 px-3">STAGE</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3">SLA</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6B7280]/10 font-body">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-[#E0E5EC]/80 transition">
                    
                    <td className="py-3 px-3 font-mono font-bold text-[#6C63FF]">
                      {r.request_number}
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-display font-bold text-[#3D4852] truncate">{r.title}</div>
                      <div className="text-[10px] text-[#6B7280] font-mono">{r.request_type_name}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#3D4852]">{r.requester_name}</div>
                      <div className="text-[10px] text-[#6B7280]">{r.requester_dept_name}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-[#3D4852]">{r.stage_name}</div>
                      <div className="text-[10px] text-[#6B7280] capitalize">{r.assigned_role_code.replace('_', ' ')}</div>
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="py-3 px-3">
                      <SlaBadge sla={r.sla} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/requests/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl neu-button-primary text-white font-mono text-[10px] font-bold"
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
