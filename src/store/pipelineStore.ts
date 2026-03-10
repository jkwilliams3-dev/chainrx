import { create } from 'zustand';
import type { Claim, ClaimStatus } from '../types';
import { mockClaims } from '../data/mockClaims';
import { canAdvanceStage } from '../utils/pipelineUtils';

interface PipelineState {
  claims: Claim[];
  advanceClaim: (claimId: string, userRole: string) => boolean;
  getClaimsByStage: (stage: ClaimStatus) => Claim[];
  getStageTotals: (stage: ClaimStatus) => number;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  claims: mockClaims,
  advanceClaim: (claimId, userRole) => {
    if (userRole === 'AUDITOR') return false;
    const claims = get().claims;
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return false;
    const nextStage = canAdvanceStage(claim.status);
    if (!nextStage) return false;
    set({
      claims: claims.map(c =>
        c.id === claimId ? { ...c, status: nextStage, daysInStage: 0 } : c
      ),
    });
    return true;
  },
  getClaimsByStage: (stage) => get().claims.filter(c => c.status === stage),
  getStageTotals: (stage) =>
    get().claims.filter(c => c.status === stage).reduce((sum, c) => sum + c.amount, 0),
}));
