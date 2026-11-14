import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, BookOpen, KeyRound, Info, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, resetPasswordRequest } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState('admin@esic.edu.in');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        success('Authentication Verified', 'Welcome to ESIC Medical College Library Management System.');
      } else {
        error('Login Failed', res.message || 'Invalid credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demoPass123');
    setIsLoading(true);
    try {
      const res = await login(demoEmail, 'demoPass123');
      if (res.success) {
        success('Demonstration Login', `Logged in as ${demoEmail}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      error('Input Required', 'Please enter your registered institutional email.');
      return;
    }
    const res = await resetPasswordRequest(resetEmail.trim());
    if (res.success) {
      success('Password Reset Dispatched', res.message);
      setIsResetMode(false);
    } else {
      error('Reset Failed', res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Institutional Branding Header */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white text-center border-b border-teal-800/40">
          <div className="w-14 h-14 mx-auto rounded-xl bg-teal-600 flex items-center justify-center text-white text-2xl shadow-lg mb-3">
            🏛️
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">LibraCare ESIC</h1>
          <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mt-0.5">
            ESIC Medical College and Hospital
          </p>
          <p className="text-[11px] text-slate-400">Sangareddy, Telangana, India</p>

          <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Shield className="w-3 h-3 text-teal-400" />
            Authority-Only Secure Access Portal
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isResetMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Official Email Address"
                type="email"
                placeholder="admin@esic.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsResetMode(true);
                    }}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-sm font-semibold"
                isLoading={isLoading}
              >
                Sign In to Authority Console
              </Button>

              {/* Demo Mode Quick Access Pills */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-semibold block text-center mb-2">
                  Proposal Presentation — Quick Demonstration Roles:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@esic.edu.in')}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-left transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                        Super Admin
                      </span>
                      <Shield className="w-3 h-3 text-teal-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">Dr. V. K. Sharma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('librarian@esic.edu.in')}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-left transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                        Librarian
                      </span>
                      <BookOpen className="w-3 h-3 text-teal-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">Smt. P. Sunitha</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm">Reset Password</h3>
              </div>
              <p className="text-xs text-slate-500">
                Enter your institutional email address. An authorized password reset link will be logged in the system.
              </p>

              <Input
                label="Institutional Email"
                type="email"
                placeholder="name@esic.edu.in"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsResetMode(false)}>
                  Back to Login
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}

          {/* Student Portal Notice */}
          <div className="mt-5 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              Phase 1 is an <strong>Authority-Only System</strong>. Public registration is disabled to ensure
              institutional data governance. Students do not have login access in this phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
