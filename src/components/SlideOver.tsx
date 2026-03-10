import { X, ArrowRight, Calendar, User, Building2, FileText, CreditCard, Shield, Clock, AlertCircle } from 'lucide-react';
import type { Claim } from '../types';
import {
  formatCurrency,
  STATUS_COLORS,
  PRIORITY_COLORS,
  RESOLVED_STATUS_COLORS,
} from '../utils/claimsUtils';
import { canAdvanceStage, STAGE_LABELS, STAGE_ORDER } from '../utils/pipelineUtils';
import { useAuthStore } from '../store/authStore';
import { usePipelineStore } from '../store/pipelineStore';

interface SlideOverProps {
  claim: Claim | null;
  onClose: () => void;
}

function StageTimeline({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {STAGE_ORDER.map((stage, idx) => {
        const stageIdx = STAGE_ORDER.indexOf(current as typeof STAGE_ORDER[0]);
        const isPast = idx < stageIdx;
        const isCurrent = stage === current;
        return (
          <div key={stage} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isCurrent ? 'bg-sky-500' : isPast ? 'bg-emerald-400' : 'bg-slate-200'
            }`} />
            <span className={`text-xs ${isCurrent ? 'text-sky-600 font-semibold' : isPast ? 'text-emerald-600' : 'text-slate-400'}`}>
              {STAGE_LABELS[stage as typeof STAGE_ORDER[0]]}
            </span>
            {idx < STAGE_ORDER.length - 1 && (
              <div className={`h-px w-3 flex-shrink-0 ${isPast ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono = false }: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Icon size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-slate-400 font-medium">{label}</div>
        <div className={`text-sm text-slate-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
    </div>
  );
}

export default function SlideOver({ claim, onClose }: SlideOverProps) {
  const { user, hasPermission } = useAuthStore();
  const { advanceClaim } = usePipelineStore();
  const canProcess = hasPermission('process');

  if (!claim) return null;

  const statusColors = STATUS_COLORS[claim.status];
  const priorityColors = PRIORITY_COLORS[claim.priority];
  const nextStage = canAdvanceStage(claim.status);

  const handleAdvance = () => {
    if (user) {
      advanceClaim(claim.id, user.role);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 slide-over-backdrop"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col slide-over-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="font-mono text-sm font-bold text-slate-500">{claim.id}</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{claim.patientName}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status row */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <span className={`badge ${statusColors.bg} ${statusColors.text} font-semibold`}>
            {claim.status}
          </span>
          {claim.resolvedStatus && (
            <span className={`badge ${RESOLVED_STATUS_COLORS[claim.resolvedStatus].bg} ${RESOLVED_STATUS_COLORS[claim.resolvedStatus].text}`}>
              {claim.resolvedStatus.replace('_', ' ')}
            </span>
          )}
          <span className={`badge ${priorityColors.bg} ${priorityColors.text}`}>
            {claim.priority} Priority
          </span>
          <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
            <Clock size={11} />
            {claim.daysOpen}d open
          </span>
        </div>

        {/* Stage timeline */}
        <div className="px-5 py-3 border-b border-slate-100 overflow-x-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Stage Progress</div>
          <StageTimeline current={claim.status} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {/* Patient info */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Patient</div>
          <div className="card p-3 mb-4">
            <DetailRow icon={User} label="Full Name" value={claim.patientName} />
            <DetailRow icon={Calendar} label="Date of Birth" value={claim.patientDOB} />
            <DetailRow icon={Shield} label="Patient ID" value={claim.patientId} mono />
          </div>

          {/* Provider info */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Provider</div>
          <div className="card p-3 mb-4">
            <DetailRow icon={Building2} label="Provider Name" value={claim.provider} />
            <DetailRow icon={FileText} label="Provider ID" value={claim.providerId} mono />
          </div>

          {/* Clinical info */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Clinical Details</div>
          <div className="card p-3 mb-4">
            <DetailRow
              icon={FileText}
              label="ICD-10 Code"
              value={
                <span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs mr-1">{claim.icd10Code}</span>
                  {claim.icd10Description}
                </span>
              }
            />
            <DetailRow icon={Calendar} label="Service Date" value={claim.serviceDate} />
            <DetailRow icon={Calendar} label="Submitted Date" value={claim.submittedDate} />
          </div>

          {/* Financial info */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Financial</div>
          <div className="card p-3 mb-4">
            <DetailRow
              icon={CreditCard}
              label="Claim Amount"
              value={<span className="text-lg font-bold text-slate-900">{formatCurrency(claim.amount)}</span>}
            />
            <DetailRow icon={Shield} label="Insurance ID" value={claim.insuranceId} mono />
            <DetailRow icon={Shield} label="Group Number" value={claim.groupNumber} mono />
          </div>

          {/* Notes */}
          {claim.notes && (
            <>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</div>
              <div className="card p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700 leading-relaxed">{claim.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer action */}
        {canProcess && nextStage && (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={handleAdvance}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              <ArrowRight size={16} />
              Advance to {STAGE_LABELS[nextStage]}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
