import type { Anomaly, AnomalyType } from '../types';

export const ANOMALY_TYPE_LABELS: Record<AnomalyType, string> = {
  DUPLICATE: 'Duplicate Submission',
  FREQUENCY: 'Unusual Frequency',
  AMOUNT_OUTLIER: 'Amount Outlier',
  EXPIRED_COVERAGE: 'Expired Coverage',
};

export const ANOMALY_TYPE_COLORS: Record<AnomalyType, { bg: string; text: string; border: string }> = {
  DUPLICATE: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  FREQUENCY: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  AMOUNT_OUTLIER: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  EXPIRED_COVERAGE: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

export function getRiskColor(score: number): { text: string; stroke: string; bg: string } {
  if (score >= 75) return { text: 'text-red-600', stroke: '#ef4444', bg: 'bg-red-50' };
  if (score >= 50) return { text: 'text-amber-600', stroke: '#f59e0b', bg: 'bg-amber-50' };
  return { text: 'text-emerald-600', stroke: '#10b981', bg: 'bg-emerald-50' };
}

export function getRiskLabel(score: number): string {
  if (score >= 75) return 'High Risk';
  if (score >= 50) return 'Medium Risk';
  return 'Low Risk';
}

export function calculateExposureTotal(anomalies: Anomaly[]): number {
  return anomalies.reduce((sum, a) => sum + a.exposureAmount, 0);
}

export function countHighRisk(anomalies: Anomaly[]): number {
  return anomalies.filter(a => a.riskScore >= 75).length;
}

export function groupByType(anomalies: Anomaly[]): Record<AnomalyType, number> {
  const result: Record<AnomalyType, number> = {
    DUPLICATE: 0,
    FREQUENCY: 0,
    AMOUNT_OUTLIER: 0,
    EXPIRED_COVERAGE: 0,
  };
  anomalies.forEach(a => { result[a.type]++; });
  return result;
}
