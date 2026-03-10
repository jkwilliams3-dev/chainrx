import { AlertCircle, TrendingUp, Clock } from 'lucide-react';
import type { Anomaly } from '../types';
import { ANOMALY_TYPE_LABELS, ANOMALY_TYPE_COLORS, getRiskColor, getRiskLabel } from '../utils/anomalyUtils';
import { formatCurrency } from '../utils/claimsUtils';
import { useAnomalyStore } from '../store/anomalyStore';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface AnomalyCardProps {
  anomaly: Anomaly;
}

function RiskGauge({ score }: { score: number }) {
  const { stroke } = getRiskColor(score);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="5"
        />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-700">{score}</span>
      </div>
    </div>
  );
}

export default function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const { markInvestigated, escalate } = useAnomalyStore();
  const { hasPermission } = useAuthStore();
  const isAdmin = hasPermission('admin');

  const typeColors = ANOMALY_TYPE_COLORS[anomaly.type];
  const riskColor = getRiskColor(anomaly.riskScore);
  const riskLabel = getRiskLabel(anomaly.riskScore);

  const statusBadge = {
    OPEN: 'bg-slate-100 text-slate-600',
    INVESTIGATED: 'bg-emerald-100 text-emerald-700',
    ESCALATED: 'bg-red-100 text-red-700',
  }[anomaly.status];

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${typeColors.bg} ${typeColors.text}`}>
            {ANOMALY_TYPE_LABELS[anomaly.type]}
          </span>
          <span className={`badge ${statusBadge}`}>
            {anomaly.status}
          </span>
        </div>
        <RiskGauge score={anomaly.riskScore} />
      </div>

      {/* Risk label */}
      <div className={`text-xs font-semibold ${riskColor.text} mb-2 flex items-center gap-1`}>
        <AlertCircle size={11} />
        {riskLabel} — Score {anomaly.riskScore}/100
      </div>

      {/* Claim ID */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs text-slate-500">Claim:</span>
        <span className="text-xs font-mono font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
          {anomaly.claimId}
        </span>
        {anomaly.providerName && (
          <span className="text-xs text-slate-400 ml-1 truncate">· {anomaly.providerName}</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-700 mb-3 leading-relaxed">{anomaly.description}</p>

      {/* Exposure + time */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <TrendingUp size={11} className="text-red-400" />
          <span>Exposure:</span>
          <span className="font-semibold text-red-600">{formatCurrency(anomaly.exposureAmount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={11} />
          {formatDistanceToNow(new Date(anomaly.detectedAt), { addSuffix: true })}
        </div>
      </div>

      {/* Recommended action */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3">
        <div className="text-xs font-semibold text-amber-700 mb-1">Recommended Action</div>
        <p className="text-xs text-amber-800 leading-relaxed">{anomaly.recommendedAction}</p>
      </div>

      {/* Actions (ADMIN only) */}
      {isAdmin && anomaly.status === 'OPEN' && (
        <div className="flex gap-2">
          <button
            onClick={() => markInvestigated(anomaly.id)}
            className="flex-1 text-xs font-medium py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            Mark Investigated
          </button>
          <button
            onClick={() => escalate(anomaly.id)}
            className="flex-1 text-xs font-medium py-1.5 px-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
          >
            Escalate
          </button>
        </div>
      )}
      {isAdmin && anomaly.status === 'INVESTIGATED' && (
        <button
          onClick={() => escalate(anomaly.id)}
          className="w-full text-xs font-medium py-1.5 px-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
        >
          Escalate
        </button>
      )}
    </div>
  );
}
