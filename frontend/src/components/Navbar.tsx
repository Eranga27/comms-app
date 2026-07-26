"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Determine if we are in v1 or v2
  const isV2 = pathname.startsWith('/v2');
  const basePath = isV2 ? '/v2' : '/v1';

  // Don't show navbar on the practice session itself to keep it distraction-free
  if (pathname === '/v1/practice' || pathname === '/v2/practice') return null;

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(20,184,166,0.5)] group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            SpeakIQ {isV2 ? "V2" : "V1"}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Home
          </Link>
          <Link 
            href={`${basePath}/dashboard`} 
            className={`text-sm font-medium transition-colors ${pathname === `${basePath}/dashboard` ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dashboard
          </Link>
          <Link 
            href={`${basePath}/settings`} 
            className={`text-sm font-medium transition-colors ${pathname === `${basePath}/settings` ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Settings
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href={`${basePath}/practice`}
            className="px-5 py-2 text-sm font-medium rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-all hover:scale-105"
          >
            Start Session
          </Link>
        </div>
      </div>
    </nav>
  );
}
