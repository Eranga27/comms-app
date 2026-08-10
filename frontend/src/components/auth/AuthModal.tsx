import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, GithubIcon, EyeIcon, EyeOffIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';
import { API_URL } from '../../config';

type ModalStep = 'auth' | 'otp';

// Picks up ?token=… (OAuth success) and ?oauth_error=… (OAuth failure) from callbacks
function useOAuthTokenCapture(setError: (e: string) => void) {
  const { login, setShowAuthModal } = useAuth();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const oauthError = params.get('oauth_error');
    
    if (!token && !oauthError) return;
    // Remove params from URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      setShowAuthModal(true);
      return;
    }
    if (token) {
      fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(user => { if (user) login(token, user); })
        .catch(() => {});
    }
  }, [login, setShowAuthModal, setError]);
}

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'One uppercase', ok: /[A-Z]/.test(password) },
    { label: 'One number',    ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="mt-2 flex gap-3">
      {checks.map(c => (
        <span key={c.label} className={`flex items-center gap-1 text-[11px] ${c.ok ? 'text-emerald-400' : 'text-slate-500'}`}>
          <CheckCircleIcon className="h-3 w-3" />
          {c.label}
        </span>
      ))}
    </div>
  );
}

// Individual OTP digit input
function OtpInput({ value, onChange, onComplete }: {
  value: string;
  onChange: (v: string) => void;
  onComplete: (code: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleChange = (i: number, ch: string) => {
    const d = ch.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[i] = d;
    const joined = next.join('');
    onChange(joined);
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (joined.length === 6) onComplete(joined);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(text);
    if (text.length === 6) onComplete(text);
    refs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="h-14 w-12 rounded-xl border border-slate-700 bg-slate-950 text-center text-xl font-bold text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      ))}
    </div>
  );
}

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<ModalStep>('auth');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Must be called after setError is declared
  useOAuthTokenCapture(setError);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!showAuthModal) return null;

  // ── Client-side validation ──────────────────────────────────────────────────
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!isLogin && name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters.';
    if (!email.trim() || !email.includes('@') || !email.split('@')[1]?.includes('.'))
      errs.email = 'Please enter a valid email address.';
    if (!password)
      errs.password = 'Password is required.';
    else if (!isLogin) {
      if (password.length < 8)    errs.password = 'Password must be at least 8 characters.';
      else if (!/[A-Z]/.test(password)) errs.password = 'Password must contain an uppercase letter.';
      else if (!/[0-9]/.test(password)) errs.password = 'Password must contain a number.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit (login / register) ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const body = new URLSearchParams({ username: email.trim().toLowerCase(), password });
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
        if (res.status === 403) {
          const err = await res.json();
          const parts = (err.detail as string).split(':');
          if (parts[0] === 'EMAIL_NOT_VERIFIED') {
            setPendingEmail(parts[1]);
            setStep('otp');
            return;
          }
          throw new Error(err.detail);
        }
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Incorrect email or password.');
        }
        const data = await res.json();
        login(data.access_token, data.user);

      } else {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password, first_name: name.trim(), username: name.trim() }),
        });
        if (!res.ok) {
          const err = await res.json();
          // Surface Pydantic validation errors nicely
          if (Array.isArray(err.detail)) {
            const mapped: Record<string, string> = {};
            for (const e of err.detail) {
              const field = e.loc?.[e.loc.length - 1] as string;
              mapped[field] = e.msg.replace('Value error, ', '');
            }
            setFieldErrors(mapped);
            return;
          }
          throw new Error(err.detail || 'Registration failed. Please try again.');
        }
        const data = await res.json();
        setSuccess(data.message);
        setPendingEmail(email.trim().toLowerCase());
        setResendCooldown(60);
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verify ─────────────────────────────────────────────────────────────
  const handleOtpComplete = async (code: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp_code: code }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Invalid code.');
      }
      const data = await res.json();
      login(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message);
      setOtpValue('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, password: '__resend__' }),
      });
    } catch { /* server handles gracefully */ }
    setResendCooldown(60);
    setSuccess('A new code has been sent to your email.');
    setError('');
  };

  // ── OAuth ───────────────────────────────────────────────────────────────────
  const handleOAuth = (provider: 'google' | 'github') => {
    window.location.href = `${API_URL}/api/auth/${provider}/login`;
  };

  // ── Reset helper ────────────────────────────────────────────────────────────
  const resetToAuth = () => {
    setStep('auth');
    setOtpValue('');
    setError('');
    setSuccess('');
  };

  const inputCls = (field: string) =>
    `w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
      fieldErrors[field]
        ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500'
    }`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => { setShowAuthModal(false); resetToAuth(); }}
        />

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <Logo size="sm" />
            <button
              onClick={() => { setShowAuthModal(false); resetToAuth(); }}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {/* ── OTP Step ─────────────────────────────────── */}
            {step === 'otp' ? (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600/20">
                    <CheckCircleIcon className="h-7 w-7 text-primary-400" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">Check your email</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    We sent a 6-digit code to <span className="font-medium text-white">{pendingEmail}</span>.
                    Enter it below to verify your account.
                  </p>
                </div>

                {success && (
                  <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <OtpInput value={otpValue} onChange={setOtpValue} onComplete={handleOtpComplete} />

                <p className="mt-6 text-center text-sm text-slate-400">
                  Didn't receive it?{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="font-medium text-primary-400 hover:text-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </p>
                <button onClick={resetToAuth} className="mt-3 w-full text-center text-xs text-slate-600 hover:text-slate-400">
                  ← Back to sign in
                </button>
              </>
            ) : (
            /* ── Auth Step ─────────────────────────────────── */
            <>
              <h2 className="mb-1 font-display text-2xl font-bold text-white">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="mb-5 text-sm text-slate-400">
                {isLogin
                  ? 'Sign in to access your communication analytics.'
                  : 'Start your journey to becoming an eloquent communicator.'}
              </p>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name field (register only) */}
                {!isLogin && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                      className={inputCls('name')}
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                    {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                    className={inputCls('email')}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                      className={`${inputCls('password')} pr-12`}
                      placeholder="••••••••"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
                  {!isLogin && <PasswordStrength password={password} />}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Or continue with</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuth('google')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleOAuth('github')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </button>
              </div>

              <p className="mt-5 text-center text-sm text-slate-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setIsLogin(l => !l); setError(''); setFieldErrors({}); }}
                  className="font-medium text-primary-400 hover:text-primary-300"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => { setShowAuthModal(false); resetToAuth(); }}
                  className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
                >
                  Try it Out — 1 free session, no account needed
                </button>
              </div>
            </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
