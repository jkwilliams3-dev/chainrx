import { ArrowRight, Clock } from 'lucide-react';
import type { Claim } from '../types';
import { formatCurrency, getPatientInitials, PRIORITY_COLORS, PRIORITY_BORDER } from '../utils/claimsUtils';
import { canAdvanceStage, STAGE_LABELS } from '../utils/pipelineUtils';
import { usePipelineStore } from '../store/pipelineStore';
import { useAuthStore } from '../store/authStore';

interface ClaimCardProps {
  claim: Claim;
  onView?: (claim: Claim) => void;
}

export default function ClaimCard({ claim, onView }: ClaimCardProps) {
  const { advanceClaim } = usePipelineStore();
  const { user, hasPermission } = useAuthStore();
  const canAdvance = hasPermission('process');
  const nextStage = canAdvanceStage(claim.status);
  const priorityColors = PRIORITY_COLORS[claim.priority];
  const priorityBorder = PRIORITY_BORDER[claim.priority];

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) advanceClaim(claim.id, user.role);
  };

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 border-l-4 ${priorityBorder} shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer`}
      onClick={() => onView?.(claim)}
    >
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sky-700 text-xs font-bold">
                {getPatientInitials(claim.patientName)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono font-semibold text-slate-500">{claim.id}</div>
              <div className="text-sm font-medium text-slate-800 truncate">{claim.patientName}</div>
            </div>
          </div>
          <span className={`badge ${priorityColors.bg} ${priorityColors.text} flex-shrink-0 text-xs`}>
            {claim.priority}
          </span>
        </div>

        {/* Provider */}
        <div className="text-xs text-slate-500 truncate mb-2">{claim.provider}</div>

        {/* ICD code */}
        <div className="text-xs text-slate-400 truncate mb-2">
          <span className="font-mono bg-slate-100 px-1 rounded">{claim.icd10Code}</span>
          <span className="ml-1 truncate">{claim.icd10Description}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <div>
            <div className="text-base font-bold text-slate-800">{formatCurrency(claim.amount)}</div>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Clock size={11} />
            <span>{claim.daysInStage}d in stage</span>
          </div>
        </div>

        {/* Advance button */}
        {canAdvance && nextStage && (
          <button
            onClick={handleAdvance}
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 py-1.5 rounded-lg transition-colors border border-sky-200"
          >
            <ArrowRight size={12} />
            Advance to {STAGE_LABELS[nextStage]}
          </button>
        )}
      </div>
    </div>
  );
}
