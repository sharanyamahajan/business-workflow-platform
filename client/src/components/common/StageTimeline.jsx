import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, PlayCircle } from 'lucide-react';

export default function StageTimeline({ stages = [], currentStageId, status }) {
  if (!stages || stages.length === 0) return null;

  const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
  const isRejected = status === 'REJECTED';
  const isChangesRequested = status === 'CHANGES_REQUESTED';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        
        {/* Background Connecting Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

        {stages.map((stage, idx) => {
          const isPast = !isCompleted && idx < currentStageIndex;
          const isCurrent = !isCompleted && idx === currentStageIndex;
          const isFuture = idx > currentStageIndex;

          let nodeBg = 'bg-white border-2 border-slate-300 text-slate-400';
          let icon = <span className="text-xs font-bold">{stage.stage_order}</span>;

          if (isCompleted || isPast) {
            nodeBg = 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-xs';
            icon = <CheckCircle2 className="w-4 h-4" />;
          } else if (isCurrent) {
            if (isRejected) {
              nodeBg = 'bg-rose-600 border-2 border-rose-600 text-white shadow-xs';
              icon = <XCircle className="w-4 h-4" />;
            } else if (isChangesRequested) {
              nodeBg = 'bg-amber-500 border-2 border-amber-500 text-white shadow-xs animate-pulse';
              icon = <AlertCircle className="w-4 h-4" />;
            } else {
              nodeBg = 'bg-indigo-600 border-2 border-indigo-600 text-white ring-4 ring-indigo-100 shadow-xs animate-pulse';
              icon = <Clock className="w-4 h-4" />;
            }
          }

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10 group flex-1">
              
              {/* Stage Circle Node */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${nodeBg}`}>
                {icon}
              </div>

              {/* Stage Name & Role Badge */}
              <div className="mt-2 text-center max-w-[110px]">
                <div className={`text-[11px] font-bold leading-tight ${
                  isCurrent ? 'text-indigo-900' : isPast || isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {stage.stage_name}
                </div>
                <div className="text-[9px] font-medium text-slate-400 mt-0.5 capitalize">
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
