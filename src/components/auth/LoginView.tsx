import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, BookOpen, KeyRound, Info, Sparkles, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, resetPasswordRequest } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      error('Input Required', 'Please enter your registered institutional email and password.');
      return;
    }
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

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient warm glows matching the theme */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-coral-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-coral-200/40 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-charcoal-900/5 border border-parchment-200 overflow-hidden relative z-10">
        {/* Brand Banner with Deep Charcoal & Warm Terracotta Accents */}
        <div className="bg-charcoal-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-coral-600 to-coral-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-coral-500/30 mb-3.5 transform hover:scale-105 transition">
            📖
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">LibraCare</h1>
          <p className="text-xs font-semibold text-coral-400 uppercase tracking-widest mt-1">
            ESIC Medical College & Hospital
          </p>
          <p className="text-[11px] text-charcoal-400 mt-0.5">Sangareddy, Telangana, India</p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-coral-300 border border-white/10 backdrop-blur-xs">
            <Shield className="w-3 h-3 text-coral-400" />
            Authority-Only Secure Portal
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8">
          {!isResetMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Institutional Email"
                type="email"
                placeholder="e.g. admin@esic.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your security password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsResetMode(true);
                    }}
                    className="text-[11px] text-coral-600 hover:text-coral-700 font-medium hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md shadow-coral-500/25 mt-2"
                isLoading={isLoading}
              >
                Sign In to Authority Console
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              {/* Demo Quick-Fill Selectors */}
              <div className="pt-5 border-t border-parchment-200">
                <span className="text-[11px] text-charcoal-500 font-semibold block text-center mb-2.5">
                  Demo Presentation Roles (Click to Autofill):
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@esic.edu.in', 'admin123')}
                    className="p-3 rounded-2xl border border-parchment-200 bg-parchment-50 hover:bg-coral-50 hover:border-coral-300 text-left transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal-900 group-hover:text-coral-800">
                        Super Admin
                      </span>
                      <Shield className="w-3.5 h-3.5 text-coral-500" />
                    </div>
                    <span className="text-[10px] text-charcoal-500 block truncate mt-0.5">Dr. V. K. Sharma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('librarian@esic.edu.in', 'demoPass123')}
                    className="p-3 rounded-2xl border border-parchment-200 bg-parchment-50 hover:bg-coral-50 hover:border-coral-300 text-left transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal-900 group-hover:text-coral-800">
                        Librarian
                      </span>
                      <BookOpen className="w-3.5 h-3.5 text-coral-500" />
                    </div>
                    <span className="text-[10px] text-charcoal-500 block truncate mt-0.5">Smt. P. Sunitha</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="flex items-center gap-2 text-charcoal-900">
                <KeyRound className="w-4 h-4 text-coral-500" />
                <h3 className="font-bold text-sm">Reset Authority Password</h3>
              </div>
              <p className="text-xs text-charcoal-500">
                Enter your institutional email address. An authorized password reset link will be dispatched.
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

          {/* Student Disclaimer */}
          <div className="mt-5 p-3.5 bg-parchment-100 rounded-2xl border border-parchment-200 flex items-start gap-2.5 text-[11px] text-charcoal-600">
            <Info className="w-4 h-4 text-coral-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Authority-Only System</strong>: To ensure institutional governance, students do not have
              login privileges in Phase 1. All circulation transactions are executed by verified library staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
