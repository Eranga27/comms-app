import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon, XIcon, LogOutIcon } from 'lucide-react';
import { Logo } from './common/Logo';
import { navLinks } from '../data/landing';
import { useAuth } from '../contexts/AuthContext';

const appLinks = [
{ label: 'Dashboard', to: '/v2/dashboard' },
{ label: 'Practice', to: '/v2/practice' },
{ label: 'Settings', to: '/v2/settings' }];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const { user, setShowAuthModal, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || !isLanding ?
        'border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl' :
        'border-b border-transparent bg-transparent'}`
        }>
        
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main">
          <Link to="/" className="shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {isLanding ?
            navLinks.map((link) =>
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </a>
            ) :
            appLinks.map((link) =>
            <Link
              key={link.label}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === link.to ? 'text-white' : 'text-slate-400 hover:text-white'}`
              }>
                    {link.label}
                  </Link>
            )}
            
            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">
                Sign In
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <a
                  href="/v2/practice"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Try it Out
                </a>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-white/5 transition-transform duration-300 hover:scale-105"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-4 sm:flex">
                <span className="text-sm font-medium text-slate-300">
                  {user.first_name || user.username || user.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center justify-center rounded-full bg-slate-800 p-2.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                  aria-label="Log out"
                >
                  <LogOutIcon className="h-4 w-4" />
                </button>
                {isLanding && (
                  <Link
                    to="/v2/dashboard"
                    className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500">
                    Dashboard
                  </Link>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 text-slate-300 transition-colors hover:bg-slate-800/60 lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}>
              
              {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 flex flex-col bg-slate-950/95 px-6 pb-10 pt-24 backdrop-blur-xl lg:hidden">
          
            <div className="flex flex-col gap-1">
              {(isLanding ? navLinks.map((l) => ({ label: l.label, to: l.href })) : appLinks).map((link, i) =>
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}>
              
                  {isLanding ?
              <a
                href={link.to}
                onClick={() => setOpen(false)}
                className="block border-b border-slate-800/60 py-4 font-display text-2xl font-bold text-white">
                      {link.label}
                    </a> :

              <Link
                to={link.to}
                className="block border-b border-slate-800/60 py-4 font-display text-2xl font-bold text-white">
                      {link.label}
                    </Link>
              }
                </motion.div>
            )}
            </div>
            
            {!user ? (
              <button
              onClick={() => { setOpen(false); setShowAuthModal(true); }}
              className="mt-8 rounded-full bg-white px-6 py-4 text-center text-base font-bold text-slate-950">
                Start Practising
              </button>
            ) : (
              <div className="mt-8 flex flex-col gap-4">
                <span className="text-center font-display text-xl font-bold text-white">
                  {user.first_name || user.username || user.email}
                </span>
                {isLanding && (
                  <Link
                    to="/v2/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-primary-600 px-6 py-4 text-center text-base font-bold text-white">
                    Go to Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="rounded-full border border-slate-700 bg-slate-800 px-6 py-4 text-center text-base font-bold text-slate-300">
                  Log Out
                </button>
              </div>
            )}
          </motion.div>
        }
      </AnimatePresence>
    </>);
}