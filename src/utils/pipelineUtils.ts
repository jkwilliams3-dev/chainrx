import type { ClaimStatus } from '../types';

export const STAGE_ORDER: ClaimStatus[] = ['INTAKE', 'VERIFICATION', 'ADJUDICATION', 'REVIEW', 'RESOLVED'];

export const STAGE_LABELS: Record<ClaimStatus, string> = {
  INTAKE: 'Intake',
  VERIFICATION: 'Verification',
  ADJUDICATION: 'Adjudication',
  REVIEW: 'Review',
  RESOLVED: 'Resolved',
};

export const STAGE_COLORS: Record<ClaimStatus, string> = {
  INTAKE: 'bg-slate-100 text-slate-700',
  VERIFICATION: 'bg-blue-100 text-blue-700',
  ADJUDICATION: 'bg-purple-100 text-purple-700',
  REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
};

export function canAdvanceStage(current: ClaimStatus): ClaimStatus | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx === STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

export function getStageIndex(status: ClaimStatus): number {
  return STAGE_ORDER.indexOf(status);
}
