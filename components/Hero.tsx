'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, MessageSquare, Calendar, User, ArrowDown } from 'lucide-react';

const SAMPLES = [
  {
    input: "Send the revised pitch deck to Ananya by tomorrow 4pm",
    person: "Ananya",
    action: "Send revised pitch deck",
    due: "Tomorrow, 16:00",
    priority: "High",
  },
  {
    input: "Review Rahul's code pull request by Friday morning",
    person: "Rahul",
    action: "Review code pull request",
    due: "Friday, 10:00",
    priority: "Medium",
  },
  {
    input: "Pay vendor balance to Maya before Monday evening",
    person: "Maya",
    action: "Pay vendor balance",
    due: "Monday, 18:00",
    priority: "High",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SAMPLES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const active = SAMPLES[index];

  return (
    <section className="relative pt-6 pb-2 px-2 max-w-xl mx-auto text-center z-10">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-5 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>AI-Powered Executive Memory</span>
      </div>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug mb-3">
        Never drop a promise.
      </h1>

      {/* Subtext */}
      <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed mb-6">
        Speak or type naturally. Denevo extracts commitments in milliseconds, keeps track of deadlines, and drafts one-tap follow-ups.
      </p>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <Link
          href="/signup"
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/30 transition hover:scale-105 active:scale-95"
        >
          <span>Start Tracking Free</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-6 py-3 glass-panel text-gray-200 hover:text-white text-xs sm:text-sm font-medium rounded-2xl hover:bg-white/5 transition border border-purple-500/20"
        >
          Sign In to Space
        </Link>
      </div>

      {/* Clean, Non-Congested AI Demo Card */}
      <div className="glass-panel-glow rounded-3xl p-5 border border-purple-500/30 text-left shadow-2xl space-y-3">
        {/* Step 1: Natural input */}
        <div className="p-3.5 bg-[#070b14] border border-purple-500/25 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
            What you say or type
          </span>
          <p className="text-xs sm:text-sm text-white font-medium italic transition-all duration-300">
            &ldquo;{active.input}&rdquo;
          </p>
        </div>

        {/* Arrow connector */}
        <div className="flex justify-center -my-1">
          <div className="w-6 h-6 rounded-full bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <ArrowDown className="w-3 h-3" />
          </div>
        </div>

        {/* Step 2: Extracted Structured Card */}
        <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>{active.person}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {active.priority} Priority
            </span>
          </div>

          <p className="text-xs text-gray-200 font-medium">
            {active.action}
          </p>

          <div className="pt-2 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1 text-purple-300">
              <Calendar className="w-3 h-3" /> {active.due}
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
              <Sparkles className="w-2.5 h-2.5" /> Auto-Detected
            </span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Row-Level Security
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" /> Instant AI Extraction
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> WhatsApp Follow-ups
        </span>
      </div>
    </section>
  );
}