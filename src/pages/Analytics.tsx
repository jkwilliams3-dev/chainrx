import { TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import { useClaimsStore } from '../store/claimsStore';
import { formatCurrency } from '../utils/claimsUtils';

// Generate monthly volume data for last 12 months
function generateMonthlyData() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push({
      month: label,
      submitted: Math.floor(Math.random() * 40) + 60,
      approved: Math.floor(Math.random() * 30) + 40,
      denied: Math.floor(Math.random() * 10) + 5,
    });
  }
  return months;
}

const monthlyData = generateMonthlyData();

const PIE_COLORS = ['#64748b', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

function generateProcessingTimeData() {
  return [
    { stage: 'Intake', avgDays: 1.2 },
    { stage: 'Verification', avgDays: 3.8 },
    { stage: 'Adjudication', avgDays: 5.4 },
    { stage: 'Review', avgDays: 2.9 },
    { stage: 'Resolved', avgDays: 0.8 },
  ];
}

const processingData = generateProcessingTimeData();

export default function Analytics() {
  const { claims } = useClaimsStore();

  // KPI calculations
  const totalProcessed = claims.length;
  const resolved = claims.filter(c => c.status === 'RESOLVED');
  const paid = resolved.filter(c => c.resolvedStatus === 'PAID');
  const approvalRate = resolved.length > 0
    ? Math.round((paid.length / resolved.length) * 100)
    : 0;
  const avgDaysToResolution = resolved.length > 0
    ? Math.round(resolved.reduce((sum, c) => sum + c.daysOpen, 0) / resolved.length)
    : 0;
  const totalPaid = paid.reduce((sum, c) => sum + c.amount, 0);

  // Status distribution for pie
  const statusCounts = ['INTAKE', 'VERIFICATION', 'ADJUDICATION', 'REVIEW', 'RESOLVED'].map(status => ({
    name: status,
    value: claims.filter(c => c.status === status).length,
  }));

  // Top 10 providers by volume
  const providerMap = new Map<string, { name: string; count: number; amount: number }>();
  claims.forEach(c => {
    const existing = providerMap.get(c.providerId);
    if (existing) {
      existing.count++;
      existing.amount += c.amount;
    } else {
      providerMap.set(c.providerId, { name: c.provider, count: 1, amount: c.amount });
    }
  });
  const topProviders = Array.from(providerMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const kpis = [
    {
      label: 'Total Processed',
      value: totalProcessed.toLocaleString(),
      icon: TrendingUp,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      sub: 'All time claims',
    },
    {
      label: 'Approval Rate',
      value: `${approvalRate}%`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      sub: `${paid.length} of ${resolved.length} resolved`,
    },
    {
      label: 'Avg Days to Resolution',
      value: `${avgDaysToResolution}d`,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      sub: 'From submission to resolved',
    },
    {
      label: 'Total Paid Out',
      value: formatCurrency(totalPaid),
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      sub: 'Approved claim payments',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Claims performance and operational intelligence
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-slate-900 truncate">{kpi.value}</div>
                <div className="text-xs text-slate-400 mt-1">{kpi.sub}</div>
              </div>
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts 2x2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Claims Volume */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Claims Volume — Last 12 Months</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly submission, approval, and denial trends</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="submitted" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Submitted" />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={false} name="Approved" />
              <Line type="monotone" dataKey="denied" stroke="#ef4444" strokeWidth={2} dot={false} name="Denied" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Claims by Status (donut) */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Claims by Status</h3>
          <p className="text-xs text-slate-400 mb-4">Current pipeline distribution</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusCounts.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusCounts.map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-slate-600">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Top 10 Providers (horizontal bar) */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Top Providers by Volume</h3>
          <p className="text-xs text-slate-400 mb-4">Claim count by submitting provider</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={topProviders}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="Claims" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Avg Processing Time by Stage */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Avg Processing Time by Stage</h3>
          <p className="text-xs text-slate-400 mb-4">Average days a claim spends in each stage</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={processingData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="stage"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                unit=" d"
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="avgDays" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
