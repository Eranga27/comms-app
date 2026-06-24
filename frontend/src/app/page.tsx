import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950">
      {/* Global Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-32 flex flex-col items-center text-center max-w-6xl mx-auto w-full animate-fade-in z-10">
        <div className="inline-block px-5 py-2 mb-8 rounded-full border border-primary-500/30 bg-primary-500/10 backdrop-blur-md text-sm font-semibold text-primary-400">
          🚀 The #1 Intelligent Coaching Platform for Professionals
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white leading-tight">
          Speak with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Authority.</span><br/>
          Lead with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Presence.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl leading-relaxed">
          SpeakIQ is your personal, always-on executive coach. Master your pitch, eliminate filler words, and perfect your body language using real-time behavioral telemetry.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link 
            href="/dashboard" 
            className="px-10 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_30px_rgba(20,184,166,0.4)] text-center"
          >
            Start Practicing for Free
          </Link>
          <Link 
            href="#demo" 
            className="px-10 py-4 rounded-xl glass-panel hover:bg-slate-800 border border-slate-700 text-white font-bold text-lg transition-all duration-300 text-center"
          >
            Watch How It Works
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-slate-500 font-medium">
          Used by leaders at top companies
          <div className="flex justify-center gap-8 mt-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholder Logos */}
             <div className="text-xl font-bold font-serif">Acme Corp</div>
             <div className="text-xl font-bold font-sans tracking-tighter">GLOBEX</div>
             <div className="text-xl font-bold font-mono">Initech</div>
          </div>
        </div>
      </section>

      {/* Demo / App Preview Section */}
      <section id="demo" className="py-20 px-4 w-full bg-slate-900/50 border-y border-slate-800/50 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">See Your Communication DNA</h2>
           <div className="w-full aspect-video bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60 z-10"></div>
              {/* Fake UI Overlay for Demo */}
              <div className="absolute inset-0 z-20 flex flex-col justify-between p-6">
                 <div className="flex justify-between items-start">
                    <div className="glass-panel px-4 py-2 rounded-lg text-emerald-400 font-mono text-sm border-emerald-500/30">
                      ● Recording
                    </div>
                    <div className="flex gap-2">
                       <div className="glass-panel px-3 py-1 rounded-full text-xs text-white">Posture: 98%</div>
                       <div className="glass-panel px-3 py-1 rounded-full text-xs text-amber-400">Pace: 165 wpm (Fast)</div>
                    </div>
                 </div>
                 <div className="w-full max-w-2xl mx-auto text-center glass-panel p-4 rounded-xl backdrop-blur-md border-slate-700/50">
                    <p className="text-slate-300 font-mono">"So, <span className="bg-amber-500/20 text-amber-400 px-1 rounded">um</span>, we are uniquely positioned to..."</p>
                 </div>
              </div>
              <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform z-30">
                 <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.6)]">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* How it Works / 3 Steps */}
      <section className="py-24 px-4 max-w-6xl mx-auto w-full z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Mastery in 3 Steps</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Skip the expensive coaching sessions. SpeakIQ analyzes your performance locally in your browser for total privacy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Record a Session", desc: "Use your webcam to practice your next big speech, interview, or presentation right in your browser." },
            { step: "02", title: "Instant Behavioral Analysis", desc: "Our proprietary engine tracks your eye contact, hand gestures, posture, and transcribes your audio perfectly." },
            { step: "03", title: "Review & Improve", desc: "Get an evidence-based breakdown of your strengths, filler words, and an actionable plan to improve." }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-primary-500/50 transition-colors">
              <div className="text-6xl font-black text-slate-800/50 absolute -top-4 -right-2 group-hover:text-primary-900/30 transition-colors">{item.step}</div>
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-slate-900/30 border-t border-slate-800/50 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Comprehensive Telemetry</h2>
            <p className="text-slate-400 text-lg max-w-2xl">We track the micro-behaviors that define executive presence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z", title: "Speech Delivery", desc: "Pace (WPM), clarity, and filler word detection." },
              { icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", title: "Eye Contact", desc: "Gaze tracking to ensure you are connecting with the audience." },
              { icon: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11", title: "Hand Gestures", desc: "Open-palm gesture tracking for trust building." },
              { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: "Posture Stability", desc: "Spinal alignment monitoring to project confidence." }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl hover:bg-slate-800/80 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 text-primary-400 border border-slate-700">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 max-w-6xl mx-auto w-full z-10 text-center">
         <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Invest in Your Influence</h2>
         <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-16">Choose the plan that fits your professional goals.</p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="glass-panel p-8 rounded-2xl flex flex-col">
               <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
               <p className="text-slate-400 mb-6">For occasional practice and feedback.</p>
               <div className="text-4xl font-bold text-white mb-8">Free</div>
               <ul className="space-y-4 mb-8 flex-1">
                 <li className="flex gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Up to 3 sessions per month</li>
                 <li className="flex gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Basic filler word tracking</li>
                 <li className="flex gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Overall communication grade</li>
               </ul>
               <Link href="/dashboard" className="w-full block text-center py-3 rounded-lg glass-panel hover:bg-slate-800 text-white font-medium transition-colors">
                  Get Started
               </Link>
            </div>
            
            <div className="glass-panel p-8 rounded-2xl flex flex-col border-primary-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)] relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
               <h3 className="text-2xl font-bold text-primary-400 mb-2">Pro Coach</h3>
               <p className="text-slate-400 mb-6">For professionals aiming for mastery.</p>
               <div className="text-4xl font-bold text-white mb-8">$29<span className="text-lg text-slate-500 font-normal">/mo</span></div>
               <ul className="space-y-4 mb-8 flex-1">
                 <li className="flex gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Unlimited practice sessions</li>
                 <li className="flex gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Deep behavioral telemetry (Gaze, Gestures)</li>
                 <li className="flex gap-3 text-slate-300"><span className="text-emerald-400">✓</span> PDF Export & Shareable links</li>
                 <li className="flex gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Historical progress tracking</li>
               </ul>
               <Link href="/dashboard" className="w-full block text-center py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg transition-colors">
                  Upgrade to Pro
               </Link>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 px-4 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="text-lg font-bold text-slate-200">SpeakIQ</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
             <Link href="#" className="hover:text-slate-300 transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-slate-300 transition-colors">Terms</Link>
             <Link href="#" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
          
          <div className="text-sm text-slate-600">
             © {new Date().getFullYear()} SpeakIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
