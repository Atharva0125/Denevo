'use client';

import Link from 'next/link';
import { Home, CheckSquare, PlusCircle, User } from 'lucide-react';

export default function AppBottomNav() {
  return (
    <nav className="sticky bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 py-2 px-6 flex justify-between items-center z-50">
      <Link href="/dashboard" className="flex flex-col items-center text-purple-600">
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Today</span>
      </Link>

      <button className="flex flex-col items-center text-purple-600 -mt-5">
        <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
          <PlusCircle className="w-6 h-6" />
        </div>
      </button>

      <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-gray-900">
        <CheckSquare className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-1">Promises</span>
      </Link>
    </nav>
  );
}