import React from 'react';

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    badge: 'bg-[#F7931A]/10 border-[#F7931A]/30 text-[#F7931A]',
    dot: 'bg-[#F7931A]'
  },
  APPROVAL_PENDING: {
    label: 'Approval Pending',
    badge: 'bg-[#FFD600]/10 border-[#FFD600]/40 text-[#FFD600] font-bold shadow-[0_0_15px_rgba(255,214,0,0.2)]',
    dot: 'bg-[#FFD600] animate-ping'
  },
  PROCESSING: {
    label: 'Processing',
    badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold',
    dot: 'bg-cyan-400 animate-pulse'
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    badge: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
    dot: 'bg-amber-400'
  },
  APPROVED: {
    label: 'Approved',
    badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold',
    dot: 'bg-emerald-400'
  },
  COMPLETED: {
    label: 'Completed',
    badge: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    dot: 'bg-emerald-400'
  },
  REJECTED: {
    label: 'Rejected',
    badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    dot: 'bg-rose-500'
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-slate-800 border-slate-700 text-slate-400',
    dot: 'bg-slate-500'
  }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    badge: 'bg-slate-800 border-slate-700 text-slate-400',
    dot: 'bg-slate-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider backdrop-blur-md ${config.badge}`}>
      <span className="relative flex h-2 w-2">
        {config.dot.includes('animate-ping') && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot.replace(' animate-ping', '')}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot.replace(' animate-ping', '').replace(' animate-pulse', '')}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
}
