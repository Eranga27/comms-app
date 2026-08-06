"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Play, 
  Video, 
  Eye, 
  Mic,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Briefcase,
  Users,
  GraduationCap,
  Presentation,
  Award,
  LineChart,
  CheckCircle2
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950 font-sans selection:bg-primary-500/30">
      {/* Premium Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <main className="flex-1 relative z-10 pt-32">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32 flex flex-col items-center text-center max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-slate-300 mb-8 hover:bg-white/10 transition-colors cursor-default"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>AI-Powered Communication Coaching</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-white leading-[1.1]"
          >
            Communicate with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-teal-400">
              Absolute Clarity.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-light"
          >
            Become a better communicator with on-demand AI coaching. Master your delivery, refine your presence, and speak with confidence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center items-center"
          >
            <Link 
              href="/v2/practice" 
              className="group relative flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-full bg-white text-slate-950 font-bold text-lg transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
            >
              Start Practising Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#demo" 
              className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-full bg-slate-900/50 backdrop-blur-md border border-slate-700/50 text-white font-medium text-lg transition-all duration-300 hover:bg-slate-800"
            >
              <Play className="w-5 h-5 fill-slate-400 text-slate-400 group-hover:fill-white group-hover:text-white transition-colors" />
              Watch Demo
            </Link>
          </motion.div>
        </section>

        {/* LIVE PRODUCT PREVIEW */}
        <section id="demo" className="py-20 px-6 w-full relative z-10">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              initial: { opacity: 0, y: 40 },
              animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
            }}
            className="max-w-6xl mx-auto"
          >
             <div className="w-full aspect-[16/10] md:aspect-[16/9] bg-slate-950/80 rounded-2xl md:rounded-[2rem] border border-slate-800/80 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden relative flex flex-col group backdrop-blur-xl">
                {/* Simulated Mac OS Header */}
                <div className="h-12 border-b border-slate-800/80 flex items-center px-6 gap-2 bg-slate-900/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="mx-auto text-xs font-medium text-slate-500 flex items-center gap-2">
                    <Video className="w-3 h-3" /> Practice Session
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 relative flex">
                  {/* Main Camera View */}
                  <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90 z-10"></div>
                    
                    {/* Simulated User Profile Outline */}
                    <div className="w-64 h-64 border-2 border-dashed border-primary-500/20 rounded-full flex items-center justify-center absolute opacity-30 animate-pulse">
                       <Mic className="w-16 h-16 text-primary-500" />
                    </div>

                    {/* Fake UI Overlay for Demo */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
                       <div className="flex justify-between items-start">
                          <motion.div 
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-md text-red-400 font-mono text-xs flex items-center gap-2 backdrop-blur-md"
                          >
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            02:45
                          </motion.div>
                          <div className="flex gap-2 flex-col items-end">
                             <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white border border-slate-700/50 flex items-center gap-2">
                               <Eye className="w-3 h-3 text-emerald-400" /> Eye Contact: 92%
                             </div>
                             <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-amber-400 border border-amber-500/20 flex items-center gap-2">
                               <Activity className="w-3 h-3" /> Pace: Fast (170 wpm)
                             </div>
                          </div>
                       </div>
                       
                       <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
                          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 text-center mx-auto w-full relative overflow-hidden">
                             {/* Transcript */}
                             <p className="text-slate-300 font-medium text-lg leading-relaxed relative z-10">
                               "So, <motion.span 
                                 initial={{ backgroundColor: "rgba(245,158,11,0)" }}
                                 animate={{ backgroundColor: "rgba(245,158,11,0.2)" }}
                                 transition={{ delay: 1, duration: 0.5 }}
                                 className="text-amber-400 px-1 rounded transition-colors"
                               >basically</motion.span>, our strategy is to scale this across the entire organization."
                             </p>
                          </div>

                          {/* Interactive Timeline Preview */}
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden flex relative">
                            <div className="w-1/3 h-full bg-emerald-500"></div>
                            <div className="w-1/12 h-full bg-amber-500 relative">
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Filler Word</div>
                            </div>
                            <div className="w-1/2 h-full bg-emerald-500"></div>
                            <div className="w-2 h-4 bg-white absolute top-1/2 -translate-y-1/2 left-[40%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Side Panel Coaching */}
                  <div className="w-80 border-l border-slate-800/80 bg-slate-950/80 p-6 hidden lg:flex flex-col gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary-400" /> Live Insights
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-xs font-medium text-emerald-400 mb-1">Strong Delivery</p>
                          <p className="text-xs text-slate-400">Excellent voice projection over the last 30 seconds.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs font-medium text-amber-400 mb-1">Slow Down</p>
                          <p className="text-xs text-slate-400">Your speaking rate just spiked to 170 words per minute.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 font-medium">Confidence Score</span>
                        <span className="text-xs text-primary-400 font-bold">88/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "88%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity z-30 backdrop-blur-[2px]">
                   <div className="w-20 h-20 rounded-full bg-white text-slate-900 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] cursor-pointer">
                      <Play className="w-8 h-8 ml-1 fill-current" />
                   </div>
                </div>
             </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto w-full z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Mastery in Three Steps</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
              Skip the expensive coaching sessions. Our platform analyzes your performance locally in your browser, maintaining complete privacy.
            </p>
          </div>

          <motion.div 
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent -translate-y-1/2 z-0"></div>

            {[
              { icon: Mic, title: "Practice", desc: "Speak naturally using your camera and microphone in a distraction-free environment." },
              { icon: Activity, title: "Analyse", desc: "AI instantly analyzes your speech, body language, and communication patterns." },
              { icon: Target, title: "Improve", desc: "Receive an executive report with actionable coaching to elevate your presence." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeIn}
                className="relative z-10 flex flex-col items-center text-center p-8 rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center mb-6 shadow-lg">
                  <item.icon className="w-8 h-8 text-primary-400" />
                </div>
                <div className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Step {i + 1}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* WHO IS THIS FOR? */}
        <section className="py-24 px-6 w-full z-10 bg-slate-900/30 border-y border-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for Ambitious Communicators</h2>
                <p className="text-slate-400 text-lg font-light">Whether you're pitching a startup or interviewing for your dream job, effective communication is your greatest leverage.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: GraduationCap, title: "Students", desc: "Nail university presentations." },
                { icon: Target, title: "Graduates", desc: "Stand out in initial interviews." },
                { icon: Briefcase, title: "Professionals", desc: "Lead meetings with clarity." },
                { icon: Users, title: "Managers", desc: "Inspire and direct your team." },
                { icon: Award, title: "Executives", desc: "Build commanding presence." },
                { icon: LineChart, title: "Sales Teams", desc: "Deliver persuasive pitches." },
                { icon: Presentation, title: "Public Speakers", desc: "Captivate large audiences." },
                { icon: CheckCircle2, title: "Candidates", desc: "Master the interview process." }
              ].map((audience, i) => (
                <div key={i} className="group p-6 rounded-2xl bg-slate-950/50 border border-slate-800/50 hover:bg-primary-900/20 hover:border-primary-500/30 transition-all duration-300">
                  <audience.icon className="w-8 h-8 text-slate-500 group-hover:text-primary-400 mb-4 transition-colors" />
                  <h3 className="text-lg font-bold text-white mb-2">{audience.title}</h3>
                  <p className="text-sm text-slate-400">{audience.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY THIS PLATFORM? */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Transform How You Are Perceived</h2>
              <div className="space-y-6">
                {[
                  "Improve your confidence in high-stakes environments.",
                  "Eliminate filler words and speak with conviction.",
                  "Deliver stronger, more persuasive presentations.",
                  "Master interviews with structured storytelling.",
                  "Build executive presence and command the room.",
                  "Develop leadership communication skills."
                ].map((outcome, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-lg text-slate-300">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-emerald-500/20 blur-[100px] rounded-full"></div>
               <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 overflow-hidden shadow-2xl">
                 <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                   <h3 className="text-xl font-bold text-white">Communication DNA</h3>
                   <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-sm font-semibold">Grade: A-</span>
                 </div>
                 
                 <div className="space-y-6">
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-400">Pacing & Flow</span>
                       <span className="text-white font-medium">92%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-primary-500 w-[92%] rounded-full"></div>
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-400">Eye Contact</span>
                       <span className="text-white font-medium">85%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-400">Clarity (Filler Words)</span>
                       <span className="text-white font-medium">78%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 w-[78%] rounded-full"></div>
                     </div>
                   </div>
                 </div>

                 <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-emerald-400 mb-1">Top Strength</h4>
                      <p className="text-xs text-slate-300">Strong vocal projection and pacing.</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-amber-400 mb-1">Focus Area</h4>
                      <p className="text-xs text-slate-300">Reduce "um" and "like" usage.</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF (Placeholders ready for production) */}
        <section className="py-20 px-6 w-full bg-slate-900/50 border-y border-slate-800/50 overflow-hidden flex flex-col items-center">
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10 text-center">Trusted by ambitious communicators from</p>
           
           <div className="w-full max-w-6xl mx-auto flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="text-2xl font-bold font-sans tracking-tighter text-white">Acme Corp</div>
             <div className="text-2xl font-black font-serif italic text-white">Globex</div>
             <div className="text-2xl font-bold font-mono text-white">INITECH</div>
             <div className="text-2xl font-extrabold text-white">SOYUZ</div>
             <div className="text-2xl font-bold font-sans tracking-widest text-white">UMBRELLA</div>
           </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-32 px-6 max-w-5xl mx-auto w-full z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-b from-slate-900 to-slate-950 p-12 md:p-20 rounded-[3rem] border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight relative z-10">
              Start Building Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Communication Advantage</span>
            </h2>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 relative z-10 font-light">
              Your first personalised communication assessment is only a few minutes away. No credit card required.
            </p>
            
            <Link 
              href="/v2/practice" 
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white text-slate-950 font-bold text-xl transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] relative z-10"
            >
              Start Your First Practice Session
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-12 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Eloquent One</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
             <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms</Link>
             <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          
          <div className="text-sm text-slate-600 font-light">
             © {new Date().getFullYear()} Eloquent One. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
