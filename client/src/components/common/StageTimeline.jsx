import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

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
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-800 -z-0" />

        {stages.map((stage, idx) => {
          const isPast = !isCompleted && idx < currentStageIndex;
          const isCurrent = !isCompleted && idx === currentStageIndex;
          const isFuture = idx > currentStageIndex;

          let nodeBg = 'bg-slate-900/90 border border-slate-700/60 text-slate-500';
          let icon = <span className="text-[10px] font-mono font-bold">{stage.stage_order}</span>;

          if (isCompleted || isPast) {
            nodeBg = 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/40';
            icon = <CheckCircle2 className="w-4 h-4" />;
          } else if (isCurrent) {
            if (isRejected) {
              nodeBg = 'bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-md shadow-rose-950/40 animate-pulse';
              icon = <XCircle className="w-4 h-4" />;
            } else if (isChangesRequested) {
              nodeBg = 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/40 animate-pulse';
              icon = <AlertCircle className="w-4 h-4" />;
            } else {
              nodeBg = 'bg-gradient-to-tr from-violet-600 to-indigo-600 border border-purple-400 text-white shadow-xl shadow-violet-600/40 animate-pulse ring-2 ring-purple-500/40';
              icon = <Clock className="w-4 h-4" />;
            }
          }

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10 flex-1">
              
              {/* Stage Circle Node */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${nodeBg}`}>
                {icon}
              </div>

              {/* Stage Label */}
              <div className="mt-2 text-center max-w-[110px]">
                <div className={`text-[11px] font-bold leading-tight ${
                  isCurrent ? 'text-purple-300 font-extrabold' : isPast || isCompleted ? 'text-slate-200 font-semibold' : 'text-slate-500'
                }`}>
                  {stage.stage_name}
                </div>
                <div className="text-[9px] font-mono text-slate-400/80 mt-0.5 uppercase">
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
