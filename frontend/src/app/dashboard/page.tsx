"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Phase 4: Gamification & Settings state
  const [userName, setUserName] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingNameInput, setOnboardingNameInput] = useState("");

  const fetchSessions = async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:8000/api/sessions", { cache: "no-store" });
      if (res.ok) {
          const data = await res.json();
          setSessions(data);
      } else {
          setError("Failed to fetch sessions from server.");
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setError("Cannot connect to server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    
    // Check onboarding and name
    const storedName = localStorage.getItem("speakiq_name");
    if (storedName) setUserName(storedName);
    
    const hasOnboarded = localStorage.getItem("speakiq_onboarded");
    if (!hasOnboarded) {
        setShowOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
      localStorage.setItem("speakiq_onboarded", "true");
      if (onboardingNameInput.trim()) {
          localStorage.setItem("speakiq_name", onboardingNameInput.trim());
          setUserName(onboardingNameInput.trim());
      }
      setShowOnboarding(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.preventDefault(); // Prevent navigating to the result page
      e.stopPropagation();
      
      if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;
      
      try {
          const res = await fetch(`http://localhost:8000/api/session/${id}`, {
              method: 'DELETE'
          });
          if (res.ok) {
              setSessions(prev => prev.filter(s => s.id !== id));
          } else {
              alert("Failed to delete session.");
          }
      } catch (err) {
          alert("Error connecting to server.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center animate-fade-in">
      <div className="max-w-6xl w-full">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-emerald-400">
              Welcome back{userName ? `, ${userName}` : ''} 👋
            </h1>
            <p className="text-slate-400 mt-2">Here is an overview of your communication progress.</p>
          </div>
          <Link 
            href="/practice" 
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-medium shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)] transition-transform hover:scale-105"
          >
            + Start New Session
          </Link>
        </header>

        {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
               {error}
            </div>
        )}

        <div className="mb-8 w-full glass-panel p-6 rounded-2xl">
           <h2 className="text-xl font-semibold text-slate-200 mb-6">Progress Trend</h2>
           {sessions.length > 1 ? (
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={[...sessions].reverse()} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(val) => val ? format(new Date(val), 'MMM d') : ''} 
                      stroke="#475569" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                   />
                   <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#14b8a6' }}
                      labelFormatter={(val) => val ? format(new Date(val), 'MMM d, yyyy h:mm a') : ''}
                   />
                   <Line type="monotone" dataKey="overall_score" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', stroke: '#14b8a6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#14b8a6' }} name="Overall Score" />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-48 w-full flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                 Complete at least 2 sessions to see your progress trend.
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-slate-200">Recent Sessions</h2>
            <div className="space-y-4">
              {isLoading ? (
                  <div className="glass-panel p-8 text-center text-slate-400 rounded-2xl flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-slate-500 border-t-primary-500 rounded-full animate-spin"></div>
                      Loading sessions...
                  </div>
              ) : sessions.length === 0 && !error ? (
                <div className="glass-panel p-8 text-center text-slate-400 rounded-2xl">
                    No sessions recorded yet. Start practicing!
                </div>
              ) : (
                sessions.map((session: any) => (
                  <Link href={`/results/${session.id}`} key={session.id} className="block group">
                      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-transparent group-hover:border-primary-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl bg-slate-800 ${session.overall_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {Math.round(session.overall_score)}
                          </div>
                          <div>
                            <h3 className="text-white font-medium group-hover:text-primary-400 transition-colors">
                              {session.session_label || "Practice Session"}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {session.timestamp ? formatDistanceToNow(new Date(session.timestamp), { addSuffix: true }) : 'Unknown date'} • {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                             onClick={(e) => handleDelete(e, session.id)}
                             className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                             title="Delete Session"
                          >
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                          </button>
                          <div className="text-slate-600 group-hover:text-primary-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-200">Analytics Overview</h2>
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div>
                <h4 className="text-slate-400 text-sm font-medium mb-2">Total Practice Time</h4>
                <div className="text-3xl font-bold text-white">
                  {Math.floor(sessions.reduce((acc: number, s: any) => acc + s.duration_seconds, 0) / 60)} <span className="text-lg text-slate-500 font-normal">mins</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-slate-400 text-sm font-medium mb-2">Average Score</h4>
                <div className="text-3xl font-bold text-primary-400">
                  {sessions.length > 0 ? Math.round(sessions.reduce((acc: number, s: any) => acc + s.overall_score, 0) / sessions.length) : 0}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-slate-400 text-sm font-medium mb-2">Sessions Count</h4>
                <div className="text-3xl font-bold text-white">
                  {sessions.length}
                </div>
              </div>
            </div>

            {/* Gamification Badges */}
            <h2 className="text-xl font-semibold text-slate-200 mt-8 mb-6">Achievements</h2>
            <div className="glass-panel p-6 rounded-2xl space-y-4">
               <div className={`flex items-center gap-4 p-3 rounded-xl border ${sessions.length > 0 ? 'bg-primary-500/10 border-primary-500/30' : 'bg-slate-800/50 border-slate-700/50 opacity-50'}`}>
                  <div className="text-2xl">{sessions.length > 0 ? '🌱' : '🔒'}</div>
                  <div>
                    <h4 className={`font-semibold ${sessions.length > 0 ? 'text-primary-400' : 'text-slate-500'}`}>First Step</h4>
                    <p className="text-xs text-slate-400">Complete your first practice session.</p>
                  </div>
               </div>
               <div className={`flex items-center gap-4 p-3 rounded-xl border ${sessions.some(s => s.overall_score >= 80) ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50 opacity-50'}`}>
                  <div className="text-2xl">{sessions.some(s => s.overall_score >= 80) ? '🏆' : '🔒'}</div>
                  <div>
                    <h4 className={`font-semibold ${sessions.some(s => s.overall_score >= 80) ? 'text-emerald-400' : 'text-slate-500'}`}>High Achiever</h4>
                    <p className="text-xs text-slate-400">Score 80 or above in a session.</p>
                  </div>
               </div>
               <div className={`flex items-center gap-4 p-3 rounded-xl border ${sessions.length >= 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50 opacity-50'}`}>
                  <div className="text-2xl">{sessions.length >= 5 ? '🔥' : '🔒'}</div>
                  <div>
                    <h4 className={`font-semibold ${sessions.length >= 5 ? 'text-amber-400' : 'text-slate-500'}`}>5-Day Streak</h4>
                    <p className="text-xs text-slate-400">Complete 5 sessions total.</p>
                  </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel p-10 rounded-3xl w-full max-w-lg animate-fade-in shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-emerald-500"></div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to SpeakIQ</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Your offline-first communication intelligence platform. We process video and audio entirely on your local machine to guarantee total privacy while providing executive-level behavioral feedback.
            </p>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">What should we call you?</label>
              <input 
                type="text" 
                value={onboardingNameInput}
                onChange={(e) => setOnboardingNameInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Enter your name..."
                autoFocus
              />
            </div>
            
            <button 
               onClick={handleCompleteOnboarding}
               className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)] transition-all"
            >
               Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
