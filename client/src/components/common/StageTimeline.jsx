import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function StageTimeline({ stages = [], currentStageId, status }) {
  if (!stages || stages.length === 0) return null;

  const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
  const isRejected = status === 'REJECTED';
  const isChangesRequested = status === 'CHANGES_REQUESTED';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        
        {/* Background Connecting Line */}
        <div className="absolute top-3 left-6 right-6 h-0.5 bg-slate-300 -z-0" />

        {stages.map((stage, idx) => {
          const isPast = !isCompleted && idx < currentStageIndex;
          const isCurrent = !isCompleted && idx === currentStageIndex;
          const isFuture = idx > currentStageIndex;

          let nodeBg = 'bg-white border border-slate-300 text-slate-400';
          let icon = <span className="text-[10px] font-mono font-bold">{stage.stage_order}</span>;

          if (isCompleted || isPast) {
            nodeBg = 'bg-emerald-700 border border-emerald-800 text-white shadow-2xs';
            icon = <CheckCircle2 className="w-3.5 h-3.5" />;
          } else if (isCurrent) {
            if (isRejected) {
              nodeBg = 'bg-rose-700 border border-rose-800 text-white shadow-2xs';
              icon = <XCircle className="w-3.5 h-3.5" />;
            } else if (isChangesRequested) {
              nodeBg = 'bg-amber-600 border border-amber-700 text-white shadow-2xs animate-pulse';
              icon = <AlertCircle className="w-3.5 h-3.5" />;
            } else {
              nodeBg = 'bg-teal-700 border border-teal-800 text-white shadow-2xs ring-2 ring-teal-200 animate-pulse';
              icon = <Clock className="w-3.5 h-3.5" />;
            }
          }

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10 flex-1">
              
              {/* Stage Circle Node */}
              <div className={`w-6 h-6 rounded-xs flex items-center justify-center transition-all ${nodeBg}`}>
                {icon}
              </div>

              {/* Stage Label */}
              <div className="mt-1.5 text-center max-w-[100px]">
                <div className={`text-[10px] font-bold leading-tight ${
                  isCurrent ? 'text-slate-950 font-black' : isPast || isCompleted ? 'text-slate-800 font-semibold' : 'text-slate-400'
                }`}>
                  {stage.stage_name}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase">
                  {stage.assigned_role_code.replace('_', ' ')}
                </div>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
