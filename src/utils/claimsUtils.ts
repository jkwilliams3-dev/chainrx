import type { Claim, Priority, ClaimStatus, ResolvedStatus } from '../types';

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-400' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' },
};

export const PRIORITY_BORDER: Record<Priority, string> = {
  LOW: 'border-l-slate-400',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-500',
  CRITICAL: 'border-l-red-500',
};

export const STATUS_COLORS: Record<ClaimStatus, { bg: string; text: string }> = {
  INTAKE: { bg: 'bg-slate-100', text: 'text-slate-700' },
  VERIFICATION: { bg: 'bg-sky-100', text: 'text-sky-700' },
  ADJUDICATION: { bg: 'bg-purple-100', text: 'text-purple-700' },
  REVIEW: { bg: 'bg-amber-100', text: 'text-amber-700' },
  RESOLVED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export const RESOLVED_STATUS_COLORS: Record<ResolvedStatus, { bg: string; text: string }> = {
  PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  DENIED: { bg: 'bg-red-100', text: 'text-red-700' },
  PENDING_APPEAL: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPatientInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function filterClaims(
  claims: Claim[],
  filters: {
    search: string;
    status: ClaimStatus | 'ALL';
    priority: Priority | 'ALL';
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
  }
): Claim[] {
  return claims.filter(claim => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      !filters.search ||
      claim.id.toLowerCase().includes(searchLower) ||
      claim.patientName.toLowerCase().includes(searchLower) ||
      claim.icd10Code.toLowerCase().includes(searchLower) ||
      claim.icd10Description.toLowerCase().includes(searchLower) ||
      claim.provider.toLowerCase().includes(searchLower);

    const matchesStatus = filters.status === 'ALL' || claim.status === filters.status;
    const matchesPriority = filters.priority === 'ALL' || claim.priority === filters.priority;

    const matchesStartDate = !filters.startDate || claim.submittedDate >= filters.startDate;
    const matchesEndDate = !filters.endDate || claim.submittedDate <= filters.endDate;

    const minAmt = filters.minAmount ? parseFloat(filters.minAmount) : 0;
    const maxAmt = filters.maxAmount ? parseFloat(filters.maxAmount) : Infinity;
    const matchesAmount = claim.amount >= minAmt && claim.amount <= maxAmt;

    return matchesSearch && matchesStatus && matchesPriority && matchesStartDate && matchesEndDate && matchesAmount;
  });
}

export function sortClaims(
  claims: Claim[],
  sortKey: keyof Claim,
  sortDir: 'asc' | 'desc'
): Claim[] {
  return [...claims].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === undefined || bVal === undefined) return 0;
    let cmp = 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal));
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

export function exportToCSV(claims: Claim[]): void {
  const headers = [
    'Claim ID', 'Patient Name', 'Patient DOB', 'Patient ID',
    'Provider', 'Provider ID', 'ICD-10 Code', 'ICD-10 Description',
    'Amount', 'Submitted Date', 'Service Date', 'Status', 'Resolved Status',
    'Priority', 'Days Open', 'Days In Stage', 'Insurance ID', 'Group Number', 'Notes',
  ];

  const rows = claims.map(c => [
    c.id, c.patientName, c.patientDOB, c.patientId,
    c.provider, c.providerId, c.icd10Code, `"${c.icd10Description}"`,
    c.amount, c.submittedDate, c.serviceDate, c.status, c.resolvedStatus || '',
    c.priority, c.daysOpen, c.daysInStage, c.insuranceId, c.groupNumber,
    c.notes ? `"${c.notes}"` : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chainrx-claims-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
