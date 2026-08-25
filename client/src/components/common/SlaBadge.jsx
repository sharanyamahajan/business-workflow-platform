import React from 'react';
import { Flame, Clock, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

const SLA_CONFIG = {
  WITHIN_SLA: {
    label: 'Within SLA',
    bg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 font-bold',
    icon: ShieldCheck
  },
  APPROACHING_SLA: {
    label: 'Approaching SLA',
    bg: 'bg-amber-950/60 border-amber-500/30 text-amber-300 font-bold',
    icon: Clock
  },
  OVERDUE: {
    label: 'OVERDUE SLA',
    bg: 'bg-rose-950/80 border-rose-500/50 text-rose-300 font-extrabold animate-pulse shadow-lg shadow-rose-950/50',
    icon: Flame
  },
  COMPLETED_WITHIN_SLA: {
    label: 'Met SLA Target',
    bg: 'bg-teal-950/60 border-teal-500/30 text-teal-300',
    icon: CheckCircle2
  },
  COMPLETED_AFTER_SLA: {
    label: 'Completed Overdue',
    bg: 'bg-rose-950/50 border-rose-800/40 text-rose-300',
    icon: AlertTriangle
  }
};

export default function SlaBadge({ sla }) {
  if (!sla) return null;

  const config = SLA_CONFIG[sla.state] || {
    label: sla.state || 'Active SLA',
    bg: 'bg-slate-900 border-slate-700 text-slate-400',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold backdrop-blur-md ${config.bg}`}>
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
      {sla.timeRemainingHours !== undefined && sla.state !== 'OVERDUE' && !sla.state.startsWith('COMPLETED') && (
        <span className="opacity-80 text-[9px] font-mono border-l border-white/20 pl-1.5 ml-0.5">
          {sla.timeRemainingHours}h left
        </span>
      )}
    </span>
  );
}
