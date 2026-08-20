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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Add Commitment</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* AI Magic Input Bar */}
        <div className="mt-4 p-3 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick AI Detection
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              placeholder="e.g. Will email Vikram the sales deck by tomorrow 4pm"
              className="flex-1 px-3 py-2 bg-white border border-purple-200/70 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-purple-600"
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
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Detect'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Who did you promise?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Vikram"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Promise Action
            </label>
            <textarea
              required
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Email sales deck"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
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
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
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
            className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-purple-500/20"
          >
            {loading ? 'Saving...' : 'Save Commitment'}
          </button>
        </form>
      </div>
    </div>
  );
}