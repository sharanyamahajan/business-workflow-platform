import React from 'react';
import { Flame, Clock, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

const SLA_CONFIG = {
  WITHIN_SLA: {
    label: 'Within SLA',
    shadow: 'neu-extruded-sm text-[#38B2AC] font-medium',
    icon: ShieldCheck
  },
  APPROACHING_SLA: {
    label: 'Approaching SLA',
    shadow: 'neu-extruded-sm text-[#DD6B20] font-bold',
    icon: Clock
  },
  OVERDUE: {
    label: 'OVERDUE SLA',
    shadow: 'neu-inset text-[#E53E3E] font-extrabold animate-pulse',
    icon: Flame
  },
  COMPLETED_WITHIN_SLA: {
    label: 'Met Target',
    shadow: 'neu-extruded-sm text-[#38B2AC]',
    icon: CheckCircle2
  },
  COMPLETED_AFTER_SLA: {
    label: 'Completed Overdue',
    shadow: 'neu-inset-sm text-[#E53E3E]',
    icon: AlertTriangle
  }
};

export default function SlaBadge({ sla }) {
  if (!sla) return null;

  const config = SLA_CONFIG[sla.state] || {
    label: sla.state || 'Active SLA',
    shadow: 'neu-inset-sm text-[#6B7280]',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body ${config.shadow}`}>
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
      {sla.timeRemainingHours !== undefined && sla.state !== 'OVERDUE' && !sla.state.startsWith('COMPLETED') && (
        <span className="font-mono text-[10px] opacity-75 border-l border-[#6B7280]/30 pl-1.5 ml-0.5">
          {sla.timeRemainingHours}h left
        </span>
      )}
    </span>
  );
}
