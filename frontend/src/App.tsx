import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Practice } from './pages/Practice';
import { Dashboard } from './pages/Dashboard';
import { Results } from './pages/Results';
import { Settings } from './pages/Settings';

function Shell() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/v2/practice');

  return (
    <div className="min-h-screen w-full bg-slate-950">
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/v2/practice" element={<Practice />} />
        <Route path="/v2/dashboard" element={<Dashboard />} />
        <Route path="/v2/results/:id" element={<Results />} />
        <Route path="/v2/settings" element={<Settings />} />
      </Routes>
    </div>);

}

export function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>);

}