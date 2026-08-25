import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  FileCheck2,
  MinusCircle
} from 'lucide-react';

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-xs shadow-indigo-950/30',
    icon: Clock
  },
  APPROVAL_PENDING: {
    label: 'Approval Pending',
    bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-xs shadow-purple-950/40 animate-pulse',
    icon: Clock
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-xs shadow-cyan-950/30',
    icon: Play
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-xs shadow-amber-950/40',
    icon: AlertCircle
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-teal-500/15 border-teal-500/30 text-teal-300 shadow-xs shadow-teal-950/30',
    icon: CheckCircle2
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-xs shadow-emerald-950/30',
    icon: FileCheck2
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-xs shadow-rose-950/30',
    icon: XCircle
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    icon: MinusCircle
  }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold backdrop-blur-md ${config.bg}`}>
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
