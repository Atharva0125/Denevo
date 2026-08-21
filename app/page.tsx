'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import { Sparkles, Clock, MessageSquare, Orbit } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between text-gray-100 bg-transparent">
      <Navbar />

      <main className="flex-1 w-full px-5 pb-8 space-y-8 bg-transparent">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <section className="w-full pt-2 bg-transparent">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-100 to-cyan-300 mb-1.5 tracking-tight">
              Designed for high-trust professionals
            </h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              Stay reliable without mental overhead or complex project management tools.
            </p>
          </div>

          {/* 3 Seamless Cards */}
          <div className="space-y-3">
            {/* Row 1 */}
            <div className="glass-panel p-4 rounded-2xl border border-purple-500/25 hover:border-purple-500/40 transition duration-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-white leading-tight">Natural Input AI</h3>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                  Extracts names, deadlines, and context instantly from conversational input.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/25 hover:border-cyan-500/40 transition duration-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner">
                <Clock className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-white leading-tight">Smart Feeds</h3>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                  Clean visual cues for Overdue, Due Today, and Upcoming with quick status toggles.
                </p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/25 hover:border-emerald-500/40 transition duration-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
                <MessageSquare className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-white leading-tight">1-Tap Follow-ups</h3>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                  Generate tailored follow-up reminder messages ready to send on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Seamless Footer */}
      <footer className="border-t border-purple-500/15 py-4 px-5 text-center text-xs text-gray-400 bg-transparent">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
            <Orbit className="w-3.5 h-3.5 text-purple-400" />
            <span>Denevo AI</span>
          </div>
          <div className="flex gap-3 text-[10px] text-gray-400">
            <Link href="/login" className="hover:text-purple-300 transition">Sign In</Link>
            <Link href="/signup" className="hover:text-purple-300 transition">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}