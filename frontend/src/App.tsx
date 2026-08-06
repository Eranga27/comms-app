import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Practice } from './pages/Practice';
import { Dashboard } from './pages/Dashboard';
import { Results } from './pages/Results';
import { Settings } from './pages/Settings';

import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

function Shell() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/v2/practice');

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col">
      {!hideNav && <Navbar />}
      <AuthModal />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/v2/practice" element={<PageTransition><Practice /></PageTransition>} />
          <Route path="/v2/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/v2/results/:id" element={<PageTransition><Results /></PageTransition>} />
          <Route path="/v2/settings" element={<PageTransition><Settings /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </div>);
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}