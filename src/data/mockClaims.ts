import type { Claim, ClaimStatus, Priority, ResolvedStatus } from '../types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const providers = [
  { name: 'Lakeside Medical Group', id: 'PRV-1001' },
  { name: 'Northwest Orthopedics', id: 'PRV-1002' },
  { name: 'Valley Primary Care', id: 'PRV-1003' },
  { name: 'Metro Cardiology Associates', id: 'PRV-1004' },
  { name: 'Pinnacle Radiology', id: 'PRV-1005' },
  { name: 'Summit Urgent Care', id: 'PRV-1006' },
  { name: 'Riverside Neurology', id: 'PRV-1007' },
  { name: 'Coastal Dermatology', id: 'PRV-1008' },
  { name: 'Highland Oncology Center', id: 'PRV-1009' },
  { name: 'Meridian Family Medicine', id: 'PRV-1010' },
];

const icd10Codes = [
  { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings', minAmount: 150, maxAmount: 250 },
  { code: 'M54.5', description: 'Low back pain', minAmount: 200, maxAmount: 450 },
  { code: 'I10', description: 'Essential (primary) hypertension', minAmount: 180, maxAmount: 380 },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', minAmount: 220, maxAmount: 480 },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', minAmount: 150, maxAmount: 320 },
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis', minAmount: 200, maxAmount: 400 },
  { code: 'F32.1', description: 'Major depressive disorder, single episode, moderate', minAmount: 250, maxAmount: 550 },
  { code: 'M17.11', description: 'Primary osteoarthritis, right knee', minAmount: 400, maxAmount: 900 },
  { code: 'N18.3', description: 'Chronic kidney disease, stage 3 (moderate)', minAmount: 350, maxAmount: 750 },
  { code: 'G43.909', description: 'Migraine, unspecified, not intractable, without status migrainosus', minAmount: 300, maxAmount: 650 },
  { code: 'Z23', description: 'Encounter for immunization', minAmount: 80, maxAmount: 180 },
  { code: 'R10.9', description: 'Unspecified abdominal pain', minAmount: 2000, maxAmount: 6000 },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', minAmount: 3500, maxAmount: 12000 },
  { code: 'S72.001A', description: 'Fracture of unspecified part of neck of right femur, initial encounter', minAmount: 8000, maxAmount: 35000 },
  { code: 'C50.912', description: 'Malignant neoplasm of unspecified site of left female breast', minAmount: 8000, maxAmount: 50000 },
  { code: 'A41.9', description: 'Sepsis, unspecified organism', minAmount: 15000, maxAmount: 60000 },
  { code: 'I63.9', description: 'Cerebral infarction, unspecified', minAmount: 12000, maxAmount: 45000 },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', minAmount: 150, maxAmount: 350 },
  { code: 'M79.3', description: 'Panniculitis, unspecified', minAmount: 200, maxAmount: 500 },
  { code: 'R51', description: 'Headache', minAmount: 180, maxAmount: 420 },
];

const patientFirstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Barbara',
  'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Dorothy', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Donna', 'Andrew', 'Emily', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Timothy', 'Stephanie',
];

const patientLastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
];

const statuses: ClaimStatus[] = ['INTAKE', 'VERIFICATION', 'ADJUDICATION', 'REVIEW', 'RESOLVED'];
const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const resolvedStatuses: ResolvedStatus[] = ['PAID', 'DENIED', 'PENDING_APPEAL'];

function generateInsuranceId(): string {
  return `INS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

function generateGroupNumber(): string {
  return `GRP-${Math.floor(Math.random() * 90000) + 10000}`;
}

function generateDOB(): string {
  const year = randomBetween(1940, 2000);
  const month = String(randomBetween(1, 12)).padStart(2, '0');
  const day = String(randomBetween(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const claimNotes = [
  'Patient has history of prior authorization. All documentation submitted.',
  'Requires secondary insurance verification before processing.',
  'Pre-authorization on file. Service confirmed medically necessary.',
  'Patient contacted regarding outstanding balance. Awaiting response.',
  'Claim flagged for specialist review per protocol.',
  'Documentation complete. Ready for adjudication.',
  'Coordination of benefits required with secondary payer.',
  'Medical records requested from provider. Pending receipt.',
  undefined,
  undefined,
  undefined,
  undefined,
];

export const mockClaims: Claim[] = Array.from({ length: 110 }, (_, i) => {
  const idx = i + 1;
  const firstName = patientFirstNames[i % patientFirstNames.length];
  const lastName = patientLastNames[Math.floor(i / patientFirstNames.length) % patientLastNames.length];
  const patientName = `${firstName} ${lastName}`;
  const provider = providers[i % providers.length];
  const icd = icd10Codes[i % icd10Codes.length];
  const statusIdx = Math.floor(i / 22);
  const status = statuses[Math.min(statusIdx, 4)];
  const submittedDaysAgo = randomBetween(1, 90);
  const serviceDaysAgo = submittedDaysAgo + randomBetween(1, 5);
  const daysInStage = randomBetween(0, 14);
  const daysOpen = submittedDaysAgo;
  const priorityIdx = i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0;
  const priority = priorities[priorityIdx];
  const amount = Math.floor(randomBetween(icd.minAmount, icd.maxAmount) / 10) * 10;
  const noteIdx = i % claimNotes.length;

  const claim: Claim = {
    id: `CLM-${String(10000 + idx).padStart(5, '0')}`,
    patientName,
    patientDOB: generateDOB(),
    patientId: `PAT-${String(20000 + idx).padStart(5, '0')}`,
    provider: provider.name,
    providerId: provider.id,
    icd10Code: icd.code,
    icd10Description: icd.description,
    amount,
    submittedDate: daysAgo(submittedDaysAgo),
    status,
    daysInStage,
    daysOpen,
    priority,
    insuranceId: generateInsuranceId(),
    groupNumber: generateGroupNumber(),
    serviceDate: daysAgo(serviceDaysAgo),
    notes: claimNotes[noteIdx],
  };

  if (status === 'RESOLVED') {
    claim.resolvedStatus = resolvedStatuses[i % resolvedStatuses.length];
  }

  return claim;
});
