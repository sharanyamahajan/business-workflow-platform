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
  ShieldAlert
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
    <div className="max-w-4xl mx-auto space-y-4 pb-6 font-sans">
      
      <div className="pb-3 border-b border-slate-300">
        <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">Create Request</h1>
        <p className="text-xs text-slate-500 mt-0.5">Select a business workflow type to initiate department review</p>
      </div>

      {/* Workflow Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {requestTypes.map(t => {
          const Icon = WORKFLOW_ICONS[t.code] || Key;
          const isSelected = selectedTypeId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => selectType(t)}
              className={`p-3.5 rounded-md border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-950 bg-slate-900 text-white shadow-2xs'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div>
                <div className={`w-7 h-7 rounded-xs flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h2 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{t.name}</h2>
                <p className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{t.description}</p>
              </div>

              <div className={`mt-2.5 pt-1.5 border-t flex items-center justify-between text-[10px] font-mono ${
                isSelected ? 'border-slate-800 text-teal-400' : 'border-slate-100 text-slate-400'
              }`}>
                <span>SLA: {t.target_sla_hours}h</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Workflow Form */}
      {selectedType && (
        <form onSubmit={handleSubmit} className="bg-white rounded-md border border-slate-300/80 p-5 shadow-2xs space-y-4">
          
          <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{selectedType.name}</h2>
              <p className="text-[11px] text-slate-500">Requester: {user.full_name} ({user.dept_name})</p>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-xs">
                SLA: {selectedType.target_sla_hours}h
              </span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xs bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Request Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xs text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-slate-900"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              DYNAMIC_FORM_FIELDS ({selectedType.code})
            </div>

            {selectedType.form_schema?.fields?.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {field.label} {field.required && <span className="text-rose-600">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    rows={3}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xs text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Select option...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xs text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Supporting Attachment (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-md p-4 text-center hover:bg-slate-50 transition cursor-pointer">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-4 h-4 text-slate-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">
                  {file ? file.name : 'Select receipt or quotation file to attach (PDF, PNG, JPG, DOCX)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">MAX_SIZE: 10MB</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[10px] text-slate-500">
              Will route to Reporting Manager for initial approval.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xs shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
