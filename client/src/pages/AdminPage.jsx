import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { ShieldCheck, Users, Workflow, Building, Plus, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Provision user modal state
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState('1');
  const [deptId, setDeptId] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOverview();
  }, [user]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/overview`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const resData = await res.json();
        setData(resData);
      }
    } catch (err) {
      console.error('Admin overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password: 'Password123!',
          full_name: fullName,
          role_id: parseInt(roleId),
          department_id: parseInt(deptId)
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to provision user');
      }

      setMessage(`User ${fullName} provisioned successfully!`);
      setEmail('');
      setFullName('');
      setShowModal(false);
      fetchOverview();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading admin configuration...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Administration</h1>
          <p className="text-xs text-slate-500 mt-1">Configure workflow stage pipelines, user roles, and department structures</p>
        </div>
        
        {user.role_code === 'SYSTEM_ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          message.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {message.startsWith('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{message}</span>
        </div>
      )}

      {/* 1. Workflow Pipeline Inspector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Workflow className="w-4 h-4 text-blue-600" />
          <span>Configured Workflow Stage Pipelines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.requestTypes?.map(type => {
            const stages = data.workflowStages?.filter(s => s.request_type_id === type.id) || [];
            return (
              <div key={type.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{type.name}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">SLA: {type.target_sla_hours}h</span>
                </div>
                <div className="space-y-1.5">
                  {stages.map(s => (
                    <div key={s.id} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{s.stage_order}. {s.stage_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{s.assigned_role_code}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. System Roles & Department Structures Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Roles List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Defined System Roles ({data.roles?.length})</span>
          </h2>
          <div className="space-y-2">
            {data.roles?.map(r => (
              <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{r.name}</div>
                  <div className="text-[10px] text-slate-500">{r.description}</div>
                </div>
                <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded border border-indigo-200">{r.code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Departments List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Active Departments ({data.departments?.length})</span>
          </h2>
          <div className="space-y-2">
            {data.departments?.map(d => (
              <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                <span className="font-bold text-slate-800">{d.name}</span>
                <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded border border-emerald-200">{d.code}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Provision User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleProvisionUser} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Provision New User Account</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {data.roles?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {data.departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Provision User
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
