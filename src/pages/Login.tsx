import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const demoCredentials = [
  { label: 'Admin', email: 'admin@chainrx.io', password: 'Secure#2025!', description: 'Full access', color: 'text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100' },
  { label: 'Reviewer', email: 'reviewer@chainrx.io', password: 'Review#2025!', description: 'Process claims', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  { label: 'Auditor', email: 'auditor@chainrx.io', password: 'Audit#2025!', description: 'Read-only', color: 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/pipeline', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/pipeline', { replace: true });
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const fillCredentials = (creds: { email: string; password: string }) => {
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-sky-900 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Shield size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ChainRx</h1>
            <p className="text-sky-300 text-sm mt-1">Claims Intelligence Platform</p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the platform</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <Lock size={14} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@chainrx.io"
                    required
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
                Demo Quick Access
              </div>
              <div className="grid grid-cols-3 gap-2">
                {demoCredentials.map(cred => (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => fillCredentials(cred)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-medium transition-colors ${cred.color}`}
                  >
                    <span className="font-bold">{cred.label}</span>
                    <span className="text-xs opacity-70 mt-0.5">{cred.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HIPAA footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield size={12} className="text-emerald-500" />
              <span>HIPAA Compliant · SOC 2 Type II Certified · 256-bit AES Encryption</span>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="text-center mt-4 text-xs text-slate-500">
          ChainRx Platform v2.4.1 · © 2025 ChainRx, Inc.
        </div>
      </div>
    </div>
  );
}
