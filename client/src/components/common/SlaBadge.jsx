import React from 'react';
import { Flame, Clock, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

const SLA_CONFIG = {
  WITHIN_SLA: {
    label: 'Within SLA',
    style: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-mono',
    icon: ShieldCheck
  },
  APPROACHING_SLA: {
    label: 'Approaching SLA',
    style: 'bg-[#FFD600]/10 border-[#FFD600]/40 text-[#FFD600] font-mono font-bold shadow-[0_0_15px_rgba(255,214,0,0.2)]',
    icon: Clock
  },
  OVERDUE: {
    label: 'OVERDUE SLA',
    style: 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-mono font-extrabold animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    icon: Flame
  },
  COMPLETED_WITHIN_SLA: {
    label: 'Met Target',
    style: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-mono',
    icon: CheckCircle2
  },
  COMPLETED_AFTER_SLA: {
    label: 'Completed Overdue',
    style: 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-mono',
    icon: AlertTriangle
  }
};

export default function SlaBadge({ sla }) {
  if (!sla) return null;

  const config = SLA_CONFIG[sla.state] || {
    label: sla.state || 'Active SLA',
    style: 'bg-slate-800 border-slate-700 text-slate-400 font-mono',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] uppercase tracking-wider backdrop-blur-md ${config.style}`}>
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
      {sla.timeRemainingHours !== undefined && sla.state !== 'OVERDUE' && !sla.state.startsWith('COMPLETED') && (
        <span className="font-mono text-[9px] border-l border-white/20 pl-1.5 ml-0.5 opacity-80">
          {sla.timeRemainingHours}h left
        </span>
      )}
    </span>
  );
}
