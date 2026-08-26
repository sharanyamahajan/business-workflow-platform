import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
    setSubmitting(true);
    try {
      await switchDemoUser(demoEmail);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E0E5EC] flex items-center justify-center p-4 font-body text-[#3D4852]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-[#E0E5EC] rounded-[32px] neu-extruded overflow-hidden">
        
        {/* Left Side: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-[#6C63FF] font-display font-extrabold text-xl">
                W
              </div>
              <span className="font-display font-extrabold text-[#3D4852] text-xl tracking-tight">WorkflowOps</span>
            </div>

            <h1 className="text-2xl font-display font-extrabold text-[#3D4852]">Sign in to platform</h1>
            <p className="text-xs text-[#6B7280] mt-1">Enterprise Operations & Workflow Management System</p>

            {error && (
              <div className="mt-4 p-3.5 rounded-2xl neu-inset text-[#E53E3E] text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#E53E3E] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-display font-bold text-[#3D4852] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-[#3D4852] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 neu-button-primary text-white font-display font-bold text-xs rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-[#6B7280]/20 text-[11px] text-[#6B7280] text-center">
            Default test password: <code className="neu-inset-sm text-[#6C63FF] px-2 py-0.5 rounded-full font-mono font-bold">Password123!</code>
          </div>
        </div>

        {/* Right Side: Quick Persona Login Buttons */}
        <div className="p-8 sm:p-10 bg-[#E0E5EC] border-t md:border-t-0 md:border-l border-[#6B7280]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#6C63FF] font-display font-bold text-xs mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Evaluator Demo Shortcuts</span>
            </div>
            <h2 className="text-base font-display font-extrabold text-[#3D4852]">Quick Switch Persona</h2>
            <p className="text-xs text-[#6B7280] mt-1 mb-4">
              Test role-specific workflows, approvals, and SLA dashboards instantly with 1-click:
            </p>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => handleDemoSelect(u.email)}
                  disabled={submitting}
                  className="w-full text-left p-3 rounded-2xl neu-button-secondary text-[#3D4852] flex items-center justify-between group transition"
                >
                  <div>
                    <div className="text-xs font-display font-bold text-[#3D4852] group-hover:text-[#6C63FF]">{u.label}</div>
                    <div className="text-[10px] text-[#6B7280] font-mono">{u.email} • {u.dept}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#6B7280] group-hover:text-[#6C63FF]" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-[10px] text-[#6B7280] font-mono">
            * Backend independently enforces RBAC policies at every endpoint regardless of frontend role selection.
          </div>
        </div>

      </div>
    </div>
  );
}
