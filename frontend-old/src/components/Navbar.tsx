"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show navbar on the practice session itself
  if (pathname === '/v1/practice' || pathname === '/v2/practice') return null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "About", href: "/#about" },
    { name: "Sign In", href: "/v2/dashboard" }, // Using dashboard as proxy for sign in
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 py-3 shadow-lg shadow-black/20" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group z-50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] group-hover:scale-105 transition-transform duration-300">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Eloquent One
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname === link.href ? "text-white" : "text-slate-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <Link 
            href="/v2/practice"
            className="px-6 py-2.5 text-sm font-semibold rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Start Practising
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden z-50 text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full h-screen bg-slate-950/95 backdrop-blur-3xl z-40 flex flex-col items-center justify-center gap-8 px-6"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/v2/practice"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 px-8 py-4 text-lg w-full max-w-xs text-center font-bold rounded-full bg-white text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Start Practising
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
