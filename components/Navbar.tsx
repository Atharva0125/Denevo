'use client';

import Link from 'next/link';
import { Orbit } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-purple-500/15 backdrop-blur-xl px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        {/* Centered Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.45)] group-hover:scale-105 transition duration-200">
            <Orbit className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
            Denevo
            <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AI
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}