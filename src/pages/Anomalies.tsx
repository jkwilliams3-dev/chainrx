import { AlertTriangle, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { useAnomalyStore } from '../store/anomalyStore';
import AnomalyCard from '../components/AnomalyCard';
import { ANOMALY_TYPE_LABELS, calculateExposureTotal, countHighRisk, groupByType } from '../utils/anomalyUtils';
import { formatCurrency } from '../utils/claimsUtils';
import type { AnomalyType } from '../types';

const TYPE_FILTERS: (AnomalyType | 'ALL')[] = ['ALL', 'DUPLICATE', 'FREQUENCY', 'AMOUNT_OUTLIER', 'EXPIRED_COVERAGE'];

// Generate 30-day trend data
function generateTrendData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    data.push({
      date: label,
      detected: Math.floor(Math.random() * 4) + (i < 7 ? 2 : 1),
      resolved: Math.floor(Math.random() * 3),
    });
  }
  return data;
}

const trendData = generateTrendData();

export default function Anomalies() {
  const { anomalies, filterType, setFilterType, getFilteredAnomalies } = useAnomalyStore();
  const filtered = getFilteredAnomalies();
  const totalExposure = calculateExposureTotal(anomalies);
  const highRiskCount = countHighRisk(anomalies);
  const grouped = groupByType(anomalies);
  const resolvedToday = anomalies.filter(a => a.status !== 'OPEN').length;

  const barData = (Object.entries(grouped) as [AnomalyType, number][]).map(([type, count]) => ({
    name: ANOMALY_TYPE_LABELS[type],
    count,
  }));

  const summaryCards = [
    {
      label: 'Total Anomalies',
      value: anomalies.length,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: 'Total Exposure',
      value: formatCurrency(totalExposure),
      icon: DollarSign,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      label: 'High Risk (≥75)',
      value: highRiskCount,
      icon: TrendingUp,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      label: 'Investigated/Escalated',
      value: resolvedToday,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Anomaly Detection</h1>
        <p className="text-sm text-slate-500 mt-1">
          AI-powered fraud and billing anomaly monitoring
        </p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map(card => (
          <div key={card.label} className={`card p-4 border ${card.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">{card.label}</div>
                <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              </div>
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: anomaly list + charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Anomaly list */}
        <div>
          {/* Type filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {TYPE_FILTERS.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filterType === type
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                }`}
              >
                {type === 'ALL' ? 'All Types' : ANOMALY_TYPE_LABELS[type]}
                {type !== 'ALL' && (
                  <span className="ml-1.5 opacity-70">
                    ({grouped[type as AnomalyType]})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="card p-8 text-center text-slate-400">
                <AlertTriangle size={24} className="mx-auto mb-2 opacity-30" />
                No anomalies match the selected filter.
              </div>
            ) : (
              filtered.map(anomaly => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))
            )}
          </div>
        </div>

        {/* Right: Charts */}
        <div className="space-y-5">
          {/* Bar chart: by type */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Anomalies by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar
                  dataKey="count"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  name="Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart: 30-day trend */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-1">30-Day Detection Trend</h3>
            <p className="text-xs text-slate-400 mb-4">Anomalies detected vs. resolved per day</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="detected"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Detected"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
