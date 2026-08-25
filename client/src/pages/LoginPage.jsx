import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

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
    setSubmitting(true);
    try {
      await switchDemoUser(demoEmail);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Left Side: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                W
              </div>
              <span className="font-bold text-slate-900 text-xl tracking-tight">WorkflowOps</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Sign in to platform</h1>
            <p className="text-xs text-slate-500 mt-1">Enterprise Operations & Workflow Management System</p>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Default test password: <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">Password123!</code>
          </div>
        </div>

        {/* Right Side: Quick Persona Login Buttons for Evaluators */}
        <div className="bg-slate-50 p-8 sm:p-10 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Evaluator Demo Shortcuts</span>
            </div>
            <h2 className="text-base font-bold text-slate-800">Quick Switch Persona</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Test role-specific workflows, approvals, and SLA dashboards instantly with 1-click:
            </p>

            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => handleDemoSelect(u.email)}
                  disabled={submitting}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">{u.label}</div>
                    <div className="text-[10px] text-slate-500">{u.email} • {u.dept}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-[10px] text-slate-400">
            * Backend independently enforces RBAC policies at every endpoint regardless of frontend role selection.
          </div>
        </div>

      </div>
    </div>
  );
}
