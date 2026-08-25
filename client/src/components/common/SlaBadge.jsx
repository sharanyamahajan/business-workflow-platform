import React from 'react';
import { Flame } from 'lucide-react';

const SLA_CONFIG = {
  WITHIN_SLA: {
    label: 'Within SLA',
    style: 'text-emerald-800 bg-emerald-50 border-emerald-200'
  },
  APPROACHING_SLA: {
    label: 'Approaching SLA',
    style: 'text-amber-800 bg-amber-50 border-amber-200 font-semibold'
  },
  OVERDUE: {
    label: 'OVERDUE SLA',
    style: 'text-rose-800 bg-rose-50 border-l-2 border-rose-600 font-extrabold'
  },
  COMPLETED_WITHIN_SLA: {
    label: 'Met Target',
    style: 'text-emerald-800 bg-emerald-50 border-emerald-200'
  },
  COMPLETED_AFTER_SLA: {
    label: 'Completed Overdue',
    style: 'text-rose-800 bg-rose-50 border-rose-200'
  }
};

export default function SlaBadge({ sla }) {
  if (!sla) return null;

  const config = SLA_CONFIG[sla.state] || {
    label: sla.state || 'Active SLA',
    style: 'text-slate-700 bg-slate-100 border-slate-200'
  };

  const isOverdue = sla.state === 'OVERDUE';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[11px] font-sans ${config.style}`}>
      {isOverdue && <Flame className="w-3 h-3 text-rose-600 shrink-0" />}
      <span>{config.label}</span>
      {sla.timeRemainingHours !== undefined && !isOverdue && !sla.state.startsWith('COMPLETED') && (
        <span className="font-mono text-[10px] opacity-75 border-l border-slate-300 pl-1.5 ml-0.5">
          {sla.timeRemainingHours}h left
        </span>
      )}
    </span>
  );
}
