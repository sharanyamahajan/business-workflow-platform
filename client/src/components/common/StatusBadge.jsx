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
    bg: 'bg-blue-950/60 border-blue-500/30 text-blue-300',
    icon: Clock
  },
  APPROVAL_PENDING: {
    label: 'Approval Pending',
    bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300 animate-pulse font-bold',
    icon: Clock
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
    icon: Play
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    bg: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
    icon: AlertCircle
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-teal-950/60 border-teal-500/30 text-teal-300',
    icon: CheckCircle2
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400 font-bold',
    icon: FileCheck2
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
    icon: XCircle
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-900 border-slate-700 text-slate-400',
    icon: MinusCircle
  }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-900 border-slate-700 text-slate-400',
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
