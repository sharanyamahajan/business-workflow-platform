import React from 'react';

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    shadow: 'neu-inset-sm text-[#3D4852]',
    dot: 'bg-[#6C63FF]'
  },
  APPROVAL_PENDING: {
    label: 'Approval Pending',
    shadow: 'neu-extruded-sm text-[#DD6B20] font-bold',
    dot: 'bg-[#DD6B20] animate-pulse'
  },
  PROCESSING: {
    label: 'Processing',
    shadow: 'neu-inset-sm text-[#38B2AC] font-bold',
    dot: 'bg-[#38B2AC] animate-pulse'
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    shadow: 'neu-inset-sm text-[#DD6B20]',
    dot: 'bg-[#DD6B20]'
  },
  APPROVED: {
    label: 'Approved',
    shadow: 'neu-extruded-sm text-[#38B2AC] font-bold',
    dot: 'bg-[#38B2AC]'
  },
  COMPLETED: {
    label: 'Completed',
    shadow: 'neu-extruded-sm text-[#38B2AC] font-bold',
    dot: 'bg-[#38B2AC]'
  },
  REJECTED: {
    label: 'Rejected',
    shadow: 'neu-inset-sm text-[#E53E3E] font-bold',
    dot: 'bg-[#E53E3E]'
  },
  CANCELLED: {
    label: 'Cancelled',
    shadow: 'neu-inset-sm text-[#6B7280]',
    dot: 'bg-[#6B7280]'
  }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    shadow: 'neu-inset-sm text-[#6B7280]',
    dot: 'bg-[#6B7280]'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body ${config.shadow}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
