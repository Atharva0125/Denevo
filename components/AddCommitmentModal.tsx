'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Sparkles, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function AddCommitmentModal({ isOpen, onClose, onSuccess, userId }: Props) {
  const [naturalText, setNaturalText] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manual Form State
  const [person, setPerson] = useState('');
  const [action, setAction] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  if (!isOpen) return null;

  const handleAiExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalText.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/extract-commitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: naturalText }),
      });

      const extracted = await res.json();

      if (!extracted.person || !extracted.action) {
        throw new Error('Could not identify person or commitment. Please try manual entry.');
      }

      const { error } = await supabase.from('commitments').insert({
        user_id: userId,
        person: extracted.person,
        action: extracted.action,
        due_date: extracted.due_date || new Date().toISOString().split('T')[0],
        due_time: extracted.due_time || null,
        priority: 'none', // Default fast capture without decision friction
        status: 'pending',
        raw_text: naturalText,
      });

      if (error) throw error;

      setNaturalText('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process AI commitment');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim() || !action.trim() || !dueDate) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const formattedTime = dueTime ? (dueTime.length === 5 ? `${dueTime}:00` : dueTime) : null;

      const { error } = await supabase.from('commitments').insert({
        user_id: userId,
        person: person.trim(),
        action: action.trim(),
        due_date: dueDate,
        due_time: formattedTime,
        priority: 'none', // Default fast capture without decision friction
        status: 'pending',
        raw_text: null,
      });

      if (error) throw error;

      setPerson('');
      setAction('');
      setDueDate('');
      setDueTime('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add commitment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#0e1322]/95 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_35px_rgba(147,51,234,0.25)] text-gray-100 animate-in slide-in-from-bottom duration-200 space-y-4">
        
        {/* Header & Mode Switch */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiMode(true)}
              className={`text-xs font-bold px-2.5 py-1 rounded-xl transition flex items-center gap-1.5 ${
                isAiMode
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Promise</span>
            </button>
            <button
              onClick={() => setIsAiMode(false)}
              className={`text-xs font-bold px-2.5 py-1 rounded-xl transition ${
                !isAiMode
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Manual
            </button>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 text-[11px] text-red-300 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isAiMode ? (
          <form onSubmit={handleAiExtract} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-300/70 mb-1">
                Tell Denevo your commitment
              </label>
              <textarea
                rows={3}
                required
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g., I'll send Rahul the project plan tomorrow at 5 PM."
                className="w-full p-3 bg-[#090d16] border border-purple-500/20 rounded-2xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 resize-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !naturalText.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/30 transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                  <span>✦ Understanding your commitment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Capture with AI</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Person / Entity
              </label>
              <input
                type="text"
                required
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g., Rahul"
                className="w-full px-3 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Action / Promise
              </label>
              <input
                type="text"
                required
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g., Send quotation"
                className="w-full px-3 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Due Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400 [color-scheme:dark]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.35)]"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save Commitment</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}