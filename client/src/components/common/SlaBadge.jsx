import React from 'react';
import { Clock, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

export default function SlaBadge({ sla }) {
  if (!sla) return null;

  let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = Clock;

  if (sla.code === 'OVERDUE') {
    bgClass = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    Icon = AlertOctagon;
  } else if (sla.code === 'APPROACHING_SLA') {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  } else if (sla.code === 'COMPLETED_WITHIN_SLA') {
    bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = CheckCircle;
  } else if (sla.code === 'COMPLETED_AFTER_SLA') {
    bgClass = 'bg-orange-50 text-orange-700 border-orange-200';
    Icon = AlertTriangle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${bgClass}`}>
      <Icon className="w-3.5 h-3.5" />
      {sla.label}
    </span>
  );
}
