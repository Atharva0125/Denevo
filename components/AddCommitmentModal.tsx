'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Calendar, Clock, User, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function AddCommitmentModal({ isOpen, onClose, onSuccess, userId }: Props) {
  const [naturalText, setNaturalText] = useState('');
  const [person, setPerson] = useState('');
  const [action, setAction] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('10:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAIExtract = async () => {
    if (!naturalText.trim()) return;
    setIsExtracting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/extract-promise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: naturalText }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to extract');
      }

      const { person, action, due_date, due_time, priority } = result.data;
      if (person) setPerson(person);
      if (action) setAction(action);
      if (due_date) setDueDate(due_date);
      if (due_time) setDueTime(due_time);
      if (priority) setPriority(priority);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI extraction failed. Please fill manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const rawText = naturalText || `Promised ${person} to ${action}`;

    const { error } = await supabase.from('commitments').insert({
      user_id: userId,
      person,
      action,
      due_date: dueDate,
      due_time: dueTime ? (dueTime.length === 5 ? `${dueTime}:00` : dueTime) : null,
      priority,
      status: 'pending',
      raw_text: rawText,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setNaturalText('');
      setPerson('');
      setAction('');
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0e1322]/95 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_0_35px_rgba(147,51,234,0.3)] max-h-[90vh] overflow-y-auto text-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Log New Commitment</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 text-xs text-red-300 bg-red-950/40 border border-red-500/30 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* AI Quick Detection Glow Bar */}
        <div className="mt-4 p-3.5 bg-gradient-to-br from-purple-950/60 to-indigo-950/40 border border-purple-500/40 rounded-2xl space-y-2 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-yellow-300" /> AI Natural Input
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              placeholder="e.g. Will share the roadmap with Priya tomorrow 3pm"
              className="flex-1 px-3 py-2 bg-[#090d16] border border-purple-500/30 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAIExtract();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAIExtract}
              disabled={isExtracting || !naturalText.trim()}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-1 shrink-0 shadow-sm shadow-purple-600/30"
            >
              {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Detect'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Who did you promise?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
              <input
                type="text"
                required
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Priya"
                className="w-full pl-9 pr-3 py-2.5 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Promise Action
            </label>
            <textarea
              required
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Share project roadmap"
              className="w-full px-3 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400 [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-cyan-400 pointer-events-none" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize border transition ${
                    priority === p
                      ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-[#090d16] text-gray-400 border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.35)] border border-purple-400/30"
          >
            {loading ? 'Committing...' : 'Save Cosmic Promise'}
          </button>
        </form>
      </div>
    </div>
  );
}