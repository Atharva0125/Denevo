'use client';

import { useState, useEffect } from 'react';
import { Commitment } from '@/types/commitment';
import { X, Sparkles, Copy, Check, MessageSquare, Send, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commitment: Commitment | null;
}

export default function FollowUpModal({ isOpen, onClose, commitment }: Props) {
  const [tone, setTone] = useState<'polite' | 'casual' | 'urgent'>('polite');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateMessage = async (selectedTone: 'polite' | 'casual' | 'urgent') => {
    if (!commitment) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/generate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: commitment.person,
          action: commitment.action,
          tone: selectedTone,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate');
      }

      setMessage(data.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate follow-up message.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && commitment) {
      generateMessage(tone);
    } else {
      setMessage('');
      setCopied(false);
    }
  }, [isOpen, commitment]);

  if (!isOpen || !commitment) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0e1322]/95 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_0_35px_rgba(147,51,234,0.3)] text-gray-100 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Follow-Up</h3>
              <p className="text-[10px] text-purple-300/80">For {commitment.person}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="mt-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Select Tone
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['polite', 'casual', 'urgent'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTone(t);
                  generateMessage(t);
                }}
                className={`py-1.5 rounded-xl text-xs font-semibold capitalize border transition ${
                  tone === t
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-[#090d16] text-gray-400 border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message Output */}
        <div className="mt-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Generated Message
          </label>
          <div className="relative">
            {loading ? (
              <div className="h-24 bg-[#090d16] border border-purple-500/20 rounded-2xl flex items-center justify-center gap-2 text-xs text-purple-300 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> Crafting message...
              </div>
            ) : errorMsg ? (
              <div className="p-3 text-xs text-red-300 bg-red-950/40 border border-red-500/30 rounded-2xl">
                {errorMsg}
              </div>
            ) : (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full p-3 bg-[#090d16] border border-purple-500/20 rounded-2xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 resize-none leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2.5">
          <button
            onClick={handleCopy}
            disabled={loading || !message}
            className="flex-1 py-2.5 px-3 bg-[#090d16] hover:bg-white/5 border border-purple-500/30 text-gray-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            disabled={loading || !message}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}