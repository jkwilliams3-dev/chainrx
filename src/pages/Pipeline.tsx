import { useState } from 'react';
import { DollarSign, LayoutGrid } from 'lucide-react';
import { usePipelineStore } from '../store/pipelineStore';
import type { Claim, ClaimStatus } from '../types';
import ClaimCard from '../components/ClaimCard';
import SlideOver from '../components/SlideOver';
import { STAGE_ORDER, STAGE_LABELS } from '../utils/pipelineUtils';
import { formatCurrency } from '../utils/claimsUtils';

const STAGE_HEADER_COLORS: Record<ClaimStatus, { dot: string; badge: string }> = {
  INTAKE: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  VERIFICATION: { dot: 'bg-sky-400', badge: 'bg-sky-100 text-sky-700' },
  ADJUDICATION: { dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700' },
  REVIEW: { dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
  RESOLVED: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
};

export default function Pipeline() {
  const { getClaimsByStage, getStageTotals } = usePipelineStore();
  const [slideOverClaim, setSlideOverClaim] = useState<Claim | null>(null);

  const handleViewClaim = (claim: Claim) => {
    setSlideOverClaim(claim);
  };

  const totalClaims = STAGE_ORDER.reduce((sum, s) => sum + getClaimsByStage(s).length, 0);
  const totalValue = STAGE_ORDER.reduce((sum, s) => sum + getStageTotals(s), 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalClaims} active claims · {formatCurrency(totalValue)} total value
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <LayoutGrid size={14} className="text-sky-500" />
            <span className="text-slate-600 font-medium">Kanban View</span>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-w-0">
        {STAGE_ORDER.map(stage => {
          const claims = getClaimsByStage(stage);
          const total = getStageTotals(stage);
          const colors = STAGE_HEADER_COLORS[stage];

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-72 flex flex-col"
            >
              {/* Column header */}
              <div className="bg-white border border-slate-200 rounded-xl mb-3 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                    <span className="font-bold text-slate-800 text-sm">{STAGE_LABELS[stage]}</span>
                  </div>
                  <span className={`badge ${colors.badge} font-bold`}>
                    {claims.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <DollarSign size={11} />
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Claims list */}
              <div className="kanban-column space-y-2 pr-1">
                {claims.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                    <LayoutGrid size={20} className="mb-2 opacity-30" />
                    No claims in this stage
                  </div>
                ) : (
                  claims.map(claim => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                      onView={handleViewClaim}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SlideOver */}
      <SlideOver
        claim={slideOverClaim}
        onClose={() => setSlideOverClaim(null)}
      />
    </div>
  );
}
