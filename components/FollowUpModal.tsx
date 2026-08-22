'use client';

import { useState, useEffect } from 'react';
import { Commitment } from '@/types/commitment';
import { X, Sparkles, Copy, Check, Send, RotateCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commitment: Commitment | null;
}

export default function FollowUpModal({ isOpen, onClose, commitment }: Props) {
  const [tone, setTone] = useState<'polite' | 'casual' | 'urgent'>('polite');
  const [suggestionsCache, setSuggestionsCache] = useState<Record<string, string[]>>({});
  const [suggestionIndices, setSuggestionIndices] = useState<Record<string, number>>({
    polite: 0,
    casual: 0,
    urgent: 0,
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappTriggered, setWhatsappTriggered] = useState(false);

  const fetchToneSuggestions = async (targetTone: 'polite' | 'casual' | 'urgent', isRegen = false) => {
    if (!commitment) return;
    if (isRegen) setIsRegenerating(true);
    else setLoading(true);

    const todayStr = new Date().toISOString().split('T')[0];
    let computedStatus = 'upcoming';
    if (commitment.status === 'completed') computedStatus = 'completed';
    else if (commitment.due_date < todayStr) computedStatus = 'overdue';
    else if (commitment.due_date === todayStr) computedStatus = 'due_today';

    try {
      const res = await fetch('/api/generate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: commitment.person,
          action: commitment.action,
          dueDate: commitment.due_date,
          dueTime: commitment.due_time,
          priority: commitment.priority,
          status: computedStatus,
          tone: targetTone,
        }),
      });
      const data = await res.json();
      const list = data?.suggestions || [];

      setSuggestionsCache((prev) => ({
        ...prev,
        [targetTone]: list,
      }));

      const nextIndex = isRegen
        ? ((suggestionIndices[targetTone] || 0) + 1) % list.length
        : 0;

      setSuggestionIndices((prev) => ({
        ...prev,
        [targetTone]: nextIndex,
      }));

      setCurrentMessage(list[nextIndex] || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  // Reset and load on modal open
  useEffect(() => {
    if (isOpen && commitment) {
      setTone('polite');
      setSuggestionsCache({});
      setSuggestionIndices({ polite: 0, casual: 0, urgent: 0 });
      setCopied(false);
      setWhatsappTriggered(false);
      fetchToneSuggestions('polite');
    }
  }, [isOpen, commitment]);

  const handleToneSelect = (newTone: 'polite' | 'casual' | 'urgent') => {
    setTone(newTone);
    const cached = suggestionsCache[newTone];
    if (cached && cached.length > 0) {
      const idx = suggestionIndices[newTone] || 0;
      setCurrentMessage(cached[idx]);
    } else {
      fetchToneSuggestions(newTone);
    }
  };

  const handleRegenerate = () => {
    const list = suggestionsCache[tone];
    if (list && list.length > 0) {
      const nextIdx = ((suggestionIndices[tone] || 0) + 1) % list.length;
      setSuggestionIndices((prev) => ({
        ...prev,
        [tone]: nextIdx,
      }));
      setCurrentMessage(list[nextIdx]);
    } else {
      fetchToneSuggestions(tone, true);
    }
  };

  if (!isOpen || !commitment) return null;

  const currentIdxDisplay = (suggestionIndices[tone] || 0) + 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    setWhatsappTriggered(true);
    const encoded = encodeURIComponent(currentMessage);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;

    // Direct location assignment triggers native app deep links on mobile
    window.location.href = whatsappUrl;

    setTimeout(() => setWhatsappTriggered(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#0e1322]/95 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_35px_rgba(147,51,234,0.25)] text-gray-100 animate-in slide-in-from-bottom duration-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">✦ Follow Up with {commitment.person}</h3>
              <p className="text-[10px] text-gray-400">Denevo prepared your follow-up</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300/70 mb-1.5">
            Select Tone
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#070b14] rounded-xl border border-purple-500/20">
            {(['polite', 'casual', 'urgent'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleToneSelect(t)}
                disabled={loading || isRegenerating}
                className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  tone === t
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Draft Message Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Draft Message
              </label>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-950 border border-purple-500/30 text-purple-300 font-mono">
                {currentIdxDisplay}/3
              </span>
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={loading || isRegenerating}
              className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 transition disabled:opacity-50"
            >
              <RotateCw className={`w-2.5 h-2.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-[#080c16] border border-purple-500/25 rounded-xl text-xs text-gray-200 leading-relaxed outline-none focus:border-purple-400 resize-none transition"
            />
            {(loading || isRegenerating) && (
              <div className="absolute inset-0 bg-[#080c16]/90 backdrop-blur-xs rounded-xl flex items-center justify-center text-xs text-purple-300 font-medium gap-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span>{isRegenerating ? '✦ Cycling next version...' : '✦ Preparing your follow-up...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading || !currentMessage}
            className="py-2.5 rounded-xl border border-purple-500/30 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-300 font-bold">✓ Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={loading || !currentMessage}
            className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] border border-emerald-400/30"
          >
            {whatsappTriggered ? (
              <span>Opening WhatsApp...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}