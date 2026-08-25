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
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Request</h1>
        <p className="text-xs text-slate-500 mt-1">Select one of the 4 mandatory business workflows to submit for department review</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {requestTypes.map(t => {
          const Icon = WORKFLOW_ICONS[t.code] || Key;
          const isSelected = selectedTypeId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => selectType(t)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xs font-bold text-slate-900">{t.name}</h2>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Target SLA: {t.target_sla_hours}h
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedType && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{selectedType.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Submitting on behalf of {user.full_name} ({user.dept_name})</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                SLA Guarantee: {selectedType.target_sla_hours} Hours
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Workflow Fields ({selectedType.code})</span>
            </div>

            {selectedType.form_schema?.fields?.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    rows={3}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supporting Document / Receipt Attachment (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-xs font-bold text-blue-700">
                  {file ? file.name : 'Choose receipt or quotation file to attach (PDF, PNG, JPG, DOCX)'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Maximum size: 10MB</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Request will route to Reporting Manager for initial approval.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                <span>{submitting ? 'Creating Request...' : 'Submit Request'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
