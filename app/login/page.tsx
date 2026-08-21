'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Orbit, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#0b0f19] text-gray-100 p-6 min-h-screen relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top back navigation */}
      <div className="flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Center Container */}
      <div className="w-full max-w-sm mx-auto my-auto z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/30">
            <Orbit className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sign in to Space</h1>
          <p className="text-xs text-gray-400">
            New here?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 text-xs text-red-300 bg-red-950/40 border border-red-500/30 rounded-2xl animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleLogin} className="bg-[#121827]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 shadow-2xl space-y-3.5">
          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/30 transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom Footer Note */}
      <div className="text-center text-[10px] text-gray-500 z-10">
        &copy; 2026 Denevo AI. Secure executive storage.
      </div>
    </div>
  );
}