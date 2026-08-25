import React from 'react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  APPROVAL_PENDING: { label: 'Approval Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PROCESSING: { label: 'In Processing', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  CHANGES_REQUESTED: { label: 'Changes Requested', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </span>
  );
}
