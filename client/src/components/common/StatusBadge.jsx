import React from 'react';

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    dot: 'bg-slate-500',
    text: 'text-slate-700'
  },
  APPROVAL_PENDING: {
    label: 'Approval Pending',
    dot: 'bg-amber-600',
    text: 'text-amber-900 font-semibold'
  },
  PROCESSING: {
    label: 'Processing',
    dot: 'bg-teal-600 animate-pulse',
    text: 'text-teal-900 font-semibold'
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    dot: 'bg-amber-600',
    text: 'text-amber-900 font-semibold'
  },
  APPROVED: {
    label: 'Approved',
    dot: 'bg-emerald-600',
    text: 'text-emerald-900 font-semibold'
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-600',
    text: 'text-emerald-900 font-semibold'
  },
  REJECTED: {
    label: 'Rejected',
    dot: 'bg-rose-600',
    text: 'text-rose-900 font-semibold'
  },
  CANCELLED: {
    label: 'Cancelled',
    dot: 'bg-slate-400',
    text: 'text-slate-500'
  }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    dot: 'bg-slate-400',
    text: 'text-slate-700'
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-sans">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span className={config.text}>{config.label}</span>
    </span>
  );
}
