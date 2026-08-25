import React from 'react';
import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';

export default function StageTimeline({ stages, currentStageId, status }) {
  if (!stages || stages.length === 0) return null;

  const currentStageIndex = stages.findIndex(s => s.id === currentStageId);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-0"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 -z-0"
          style={{ width: `${(Math.max(0, currentStageIndex) / (stages.length - 1)) * 100}%` }}
        ></div>

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex || status === 'COMPLETED';
          const isCurrent = idx === currentStageIndex && status !== 'COMPLETED' && status !== 'REJECTED';
          const isRejected = status === 'REJECTED' && idx === currentStageIndex;
          const isChangesReq = status === 'CHANGES_REQUESTED' && idx === 0;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              {/* Stage Circle Node */}
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                    : isRejected
                    ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                    : isChangesReq
                    ? 'bg-orange-500 text-white ring-4 ring-orange-100 animate-bounce'
                    : isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 animate-pulse'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : isRejected ? (
                  <XCircle className="w-5 h-5" />
                ) : isChangesReq ? (
                  <AlertCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </div>

              {/* Stage Label & Details */}
              <div className="mt-2 text-center max-w-[120px]">
                <div className={`text-xs font-semibold ${isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stage.stage_name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
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
