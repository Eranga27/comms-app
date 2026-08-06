import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, GithubIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects username field
        formData.append('password', password);

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
        
        if (!res.ok) throw new Error('Invalid credentials');
        const data = await res.json();
        login(data.access_token, data.user);
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, first_name: name, username: name }),
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Registration failed');
        }
        const data = await res.json();
        login(data.access_token, data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    // In a real app, this would redirect to the backend OAuth URL
    // e.g. window.location.href = `/api/auth/${provider}/login`;
    alert(`${provider} authentication is set up in the backend API but requires Client IDs in the .env file. Please use email/password for this demo.`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <Logo size="sm" />
            <button
              onClick={() => setShowAuthModal(false)}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <h2 className="mb-2 font-display text-2xl font-bold text-white">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mb-6 text-sm text-slate-400">
              {isLogin 
                ? 'Sign in to access your communication analytics.' 
                : 'Start your journey to becoming an eloquent communicator.'}
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Or continue with</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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

            <p className="mt-6 text-center text-sm text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
