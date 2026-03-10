import { useState } from 'react';
import { Settings as SettingsIcon, Users, Shield, CheckCircle, XCircle } from 'lucide-react';
import { mockUsers, mockAuditLogs } from '../data/mockUsers';
import { format } from 'date-fns';

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {description && <div className="text-xs text-slate-400 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          enabled ? 'bg-sky-500' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 mt-1 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-sky-100 text-sky-700',
  REVIEWER: 'bg-emerald-100 text-emerald-700',
  AUDITOR: 'bg-slate-100 text-slate-600',
};

export default function Settings() {
  const [config, setConfig] = useState({
    autoRouting: true,
    fraudDetection: true,
    emailNotifications: false,
    highValueThreshold: true,
    autoEscalation: true,
  });

  const updateConfig = (key: keyof typeof config, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          System configuration, user management, and audit logs
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: System Configuration */}
        <div className="card">
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
              <SettingsIcon size={18} className="text-sky-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">System Configuration</h2>
              <p className="text-xs text-slate-400">Platform-wide settings and automation rules</p>
            </div>
          </div>
          <div className="px-5">
            <Toggle
              enabled={config.autoRouting}
              onChange={v => updateConfig('autoRouting', v)}
              label="Auto-Routing Enabled"
              description="Automatically route claims to the appropriate review queue based on ICD-10 codes and provider risk scores."
            />
            <Toggle
              enabled={config.fraudDetection}
              onChange={v => updateConfig('fraudDetection', v)}
              label="Fraud Detection Active"
              description="Run ML-based anomaly detection on all incoming claims in real time."
            />
            <Toggle
              enabled={config.emailNotifications}
              onChange={v => updateConfig('emailNotifications', v)}
              label="Email Notifications"
              description="Send email alerts to reviewers when critical claims or anomalies are detected."
            />
            <Toggle
              enabled={config.highValueThreshold}
              onChange={v => updateConfig('highValueThreshold', v)}
              label="High-Value Claim Threshold ($10,000)"
              description="Automatically flag and escalate claims exceeding $10,000 for senior review."
            />
            <Toggle
              enabled={config.autoEscalation}
              onChange={v => updateConfig('autoEscalation', v)}
              label="Auto-Escalation for High Risk Anomalies"
              description="Automatically escalate anomalies with a risk score ≥ 90 to the ADMIN queue."
            />
          </div>
        </div>

        {/* Section 2: User Management */}
        <div className="card">
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <Users size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">User Management</h2>
              <p className="text-xs text-slate-400">Manage platform users, roles, and access</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${roleColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {format(new Date(user.lastActive), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-5 py-3">
                      {user.active ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <XCircle size={12} />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-xs text-sky-600 hover:text-sky-700 font-medium hover:underline mr-3">
                        Edit
                      </button>
                      <button className={`text-xs font-medium hover:underline ${user.active ? 'text-red-500 hover:text-red-600' : 'text-emerald-600 hover:text-emerald-700'}`}>
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Audit Log */}
        <div className="card">
          <div className="flex items-center gap-3 p-5 border-b border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Shield size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Audit Log</h2>
              <p className="text-xs text-slate-400">Last 50 system events and user actions</p>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-2.5 text-xs text-slate-400 whitespace-nowrap font-mono">
                      {format(new Date(log.timestamp), 'MMM d HH:mm:ss')}
                    </td>
                    <td className="px-5 py-2.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-xs font-mono text-sky-600 whitespace-nowrap">
                      {log.resource}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-slate-500 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
