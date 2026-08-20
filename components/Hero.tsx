import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-8 pb-6 px-6 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-600 text-l font-semibold uppercase tracking-wider mb-5">
        Where words turn into action
      </div>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
        Never forget what you promised
      </h1>
      <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto mb-7">
        Denevo automatically remember your commitments, reminds you at the right time, and helps you get through with AI-powered follow-ups.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/signup"
          className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold py-3.5 rounded-2xl transition shadow-lg shadow-purple-500/25 active:scale-[0.98]"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Link>
        <a
          href="#demo"
          className="w-full text-center py-2 text-sm text-gray-500 font-medium hover:text-gray-900 transition"
        >
          See How It Works ↓
        </a>
      </div>
    </section>
  );
}