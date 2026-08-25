import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import { 
  Laptop, 
  Receipt, 
  FileCheck, 
  Key, 
  ArrowRight, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ShieldAlert,
  Zap
} from 'lucide-react';

const WORKFLOW_ICONS = {
  SOFTWARE_ACCESS: Key,
  EXPENSE_REIMBURSEMENT: Receipt,
  DOCUMENT_APPROVAL: FileCheck,
  EQUIPMENT_REQUEST: Laptop
};

export default function CreateRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [requiredDate, setRequiredDate] = useState('');
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/types`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequestTypes(data.requestTypes || []);
        if (data.requestTypes?.length > 0) {
          selectType(data.requestTypes[0]);
        }
      }
    } catch (err) {
      console.error('Fetch types error:', err);
    }
  };

  const selectType = (type) => {
    setSelectedTypeId(type.id);
    setSelectedType(type);
    setTitle(`${type.name} - ${user.full_name}`);
    
    const initialFields = {};
    if (type.form_schema?.fields) {
      type.form_schema.fields.forEach(f => {
        initialFields[f.name] = f.default || '';
      });
    }
    setFormData(initialFields);
  };

  const handleFieldChange = (name, val) => {
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_type_id: selectedTypeId,
          title,
          priority,
          required_date: requiredDate,
          form_data: formData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      const newRequestId = data.request.id;

      if (file) {
        const fileData = new FormData();
        fileData.append('file', file);

        const uploadRes = await fetch(`${API_BASE_URL}/api/requests/${newRequestId}/attachments`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: fileData
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          console.warn('Attachment upload note:', uploadErr.error);
        }
      }

      navigate(`/requests/${newRequestId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8 font-body text-slate-100 bg-grid-pattern">
      
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">Create Request Contract</h1>
        <p className="text-xs text-slate-400 mt-1">Select a cryptographic workflow type to initiate department review</p>
      </div>

      {/* Workflow Category Cards with Corner Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {requestTypes.map(t => {
          const Icon = WORKFLOW_ICONS[t.code] || Key;
          const isSelected = selectedTypeId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => selectType(t)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#EA580C]/20 via-[#0F1115] to-[#0F1115] border-[#F7931A] shadow-[0_0_30px_-5px_rgba(247,147,26,0.4)] scale-105'
                  : 'btc-card border-white/10 hover:border-[#F7931A]/50'
              }`}
            >
              {/* Corner Border Accents */}
              {isSelected && (
                <>
                  <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FFD600]"></span>
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FFD600]"></span>
                </>
              )}

              <div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-[#F7931A] text-white shadow-[0_0_15px_#F7931A]' : 'bg-white/10 text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className={`text-xs font-heading font-bold ${isSelected ? 'text-[#FFD600]' : 'text-white'}`}>{t.name}</h2>
                <p className="text-[10px] mt-1 text-slate-400 line-clamp-2">{t.description}</p>
              </div>

              <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                isSelected ? 'border-[#F7931A]/30 text-[#FFD600]' : 'border-white/5 text-slate-500'
              }`}>
                <span>SLA: {t.target_sla_hours}h</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F7931A]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Workflow Form */}
      {selectedType && (
        <form onSubmit={handleSubmit} className="btc-card rounded-2xl p-6 space-y-6">
          
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-extrabold text-white">{selectedType.name}</h2>
              <p className="text-[11px] text-slate-400">Requester: {user.full_name} ({user.dept_name})</p>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#FFD600] bg-[#F7931A]/10 border border-[#F7931A]/30 px-3 py-1 rounded-full">
                SLA Target: {selectedType.target_sla_hours} Hours
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-bold text-white mb-1.5">Request Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/60 border-b-2 border-white/20 rounded-lg text-xs text-white placeholder:text-slate-500 focus-visible:border-[#F7931A] focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-bold text-white mb-1.5">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/60 border-b-2 border-white/20 rounded-lg text-xs text-white focus-visible:border-[#F7931A] focus-visible:outline-none font-bold"
              >
                <option value="LOW" className="bg-[#0F1115]">Low Priority</option>
                <option value="MEDIUM" className="bg-[#0F1115]">Medium Priority</option>
                <option value="HIGH" className="bg-[#0F1115]">High Priority</option>
                <option value="URGENT" className="bg-[#0F1115]">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-3 border-t border-white/10">
            <div className="text-[10px] font-mono font-bold text-[#F7931A] uppercase tracking-widest">
              DYNAMIC_FORM_INPUTS ({selectedType.code})
            </div>

            {selectedType.form_schema?.fields?.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-heading font-bold text-white mb-1.5">
                  {field.label} {field.required && <span className="text-rose-400">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    rows={3}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full px-4 py-2.5 bg-black/60 border-b-2 border-white/20 rounded-lg text-xs text-white placeholder:text-slate-500 focus-visible:border-[#F7931A] focus-visible:outline-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/60 border-b-2 border-white/20 rounded-lg text-xs text-white focus-visible:border-[#F7931A] focus-visible:outline-none"
                  >
                    <option value="" className="bg-[#0F1115]">Select option...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt} className="bg-[#0F1115]">{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full px-4 py-2.5 bg-black/60 border-b-2 border-white/20 rounded-lg text-xs text-white placeholder:text-slate-500 focus-visible:border-[#F7931A] focus-visible:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10">
            <label className="block text-xs font-heading font-bold text-white mb-1.5">
              Supporting Attachment (Optional)
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition cursor-pointer">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-5 h-5 text-[#F7931A] mb-1.5" />
                <span className="text-xs font-bold text-white">
                  {file ? file.name : 'Select receipt or quotation file (PDF, PNG, JPG, DOCX)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">MAX_SIZE: 10MB</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-[10px] text-slate-400 font-mono">
              Will route to Reporting Manager for initial stage validation.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] text-white font-heading font-bold text-xs rounded-full shadow-[0_0_25px_-5px_rgba(234,88,12,0.6)] hover:scale-105 transition flex items-center gap-2 disabled:opacity-50 border border-white/20"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
