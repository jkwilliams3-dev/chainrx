export type Role = 'ADMIN' | 'REVIEWER' | 'AUDITOR';

export type ClaimStatus = 'INTAKE' | 'VERIFICATION' | 'ADJUDICATION' | 'REVIEW' | 'RESOLVED';
export type ResolvedStatus = 'PAID' | 'DENIED' | 'PENDING_APPEAL';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyType = 'DUPLICATE' | 'FREQUENCY' | 'AMOUNT_OUTLIER' | 'EXPIRED_COVERAGE';
export type AnomalyStatus = 'OPEN' | 'INVESTIGATED' | 'ESCALATED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  lastActive: string;
  active: boolean;
}

export interface Claim {
  id: string;
  patientName: string;
  patientDOB: string;
  patientId: string;
  provider: string;
  providerId: string;
  icd10Code: string;
  icd10Description: string;
  amount: number;
  submittedDate: string;
  status: ClaimStatus;
  resolvedStatus?: ResolvedStatus;
  daysInStage: number;
  daysOpen: number;
  priority: Priority;
  insuranceId: string;
  groupNumber: string;
  serviceDate: string;
  notes?: string;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  claimId: string;
  providerId?: string;
  providerName?: string;
  riskScore: number;
  description: string;
  detectedAt: string;
  status: AnomalyStatus;
  recommendedAction: string;
  exposureAmount: number;
  relatedClaimIds?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
}
