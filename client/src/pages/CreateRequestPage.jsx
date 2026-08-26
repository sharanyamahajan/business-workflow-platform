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
  AlertCircle
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
    <div className="max-w-4xl mx-auto space-y-6 pb-8 font-body text-[#3D4852]">
      
      <div className="p-6 rounded-[32px] neu-extruded">
        <h1 className="text-2xl font-display font-extrabold text-[#3D4852] tracking-tight">Create Request</h1>
        <p className="text-xs text-[#6B7280] mt-1">Select a business workflow type to initiate department review</p>
      </div>

      {/* Workflow Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {requestTypes.map(t => {
          const Icon = WORKFLOW_ICONS[t.code] || Key;
          const isSelected = selectedTypeId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => selectType(t)}
              className={`p-5 rounded-[32px] cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'neu-inset text-[#6C63FF]'
                  : 'neu-extruded neu-extruded-hover text-[#3D4852]'
              }`}
            >
              <div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                  isSelected ? 'neu-inset-deep text-[#6C63FF]' : 'neu-inset text-[#6C63FF]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className={`text-xs font-display font-bold ${isSelected ? 'text-[#6C63FF]' : 'text-[#3D4852]'}`}>{t.name}</h2>
                <p className="text-[10px] mt-1 text-[#6B7280] line-clamp-2">{t.description}</p>
              </div>

              <div className={`mt-4 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                isSelected ? 'border-[#6C63FF]/30 text-[#6C63FF]' : 'border-[#6B7280]/20 text-[#6B7280]'
              }`}>
                <span>SLA: {t.target_sla_hours}h</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6C63FF]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Workflow Form */}
      {selectedType && (
        <form onSubmit={handleSubmit} className="p-8 rounded-[32px] neu-extruded space-y-6">
          
          <div className="border-b border-[#6B7280]/20 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-display font-extrabold text-[#3D4852]">{selectedType.name}</h2>
              <p className="text-[11px] text-[#6B7280]">Requester: {user.full_name} ({user.dept_name})</p>
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#6C63FF] neu-inset-sm px-3 py-1 rounded-full">
                SLA Target: {selectedType.target_sla_hours} Hours
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl neu-inset text-[#E53E3E] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E53E3E] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-bold text-[#3D4852] mb-1.5">Request Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-[#3D4852] mb-1.5">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] font-bold neu-focus-ring"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-3 border-t border-[#6B7280]/20">
            <div className="text-[10px] font-mono font-bold text-[#6C63FF] uppercase tracking-wider">
              DYNAMIC_FORM_INPUTS ({selectedType.code})
            </div>

            {selectedType.form_schema?.fields?.map(field => (
              <div key={field.name}>
                <label className="block text-xs font-display font-bold text-[#3D4852] mb-1.5">
                  {field.label} {field.required && <span className="text-[#E53E3E]">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    rows={3}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="w-full px-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
                  />
                ) : field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] neu-focus-ring"
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
                    className="w-full px-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#6B7280]/20">
            <label className="block text-xs font-display font-bold text-[#3D4852] mb-1.5">
              Supporting Attachment (Optional)
            </label>
            <div className="p-6 rounded-3xl neu-inset-deep text-center cursor-pointer">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-5 h-5 text-[#6C63FF] mb-2" />
                <span className="text-xs font-bold text-[#3D4852]">
                  {file ? file.name : 'Select receipt or quotation file (PDF, PNG, JPG, DOCX)'}
                </span>
                <span className="text-[10px] text-[#6B7280] font-mono mt-0.5">MAX_SIZE: 10MB</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#6B7280]/20 flex items-center justify-between">
            <div className="text-[10px] text-[#6B7280] font-mono">
              Will route to Reporting Manager for initial approval.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="px-4 py-2.5 neu-button-secondary text-[#6B7280] font-bold text-xs rounded-2xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 neu-button-primary text-white font-display font-bold text-xs rounded-2xl flex items-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
