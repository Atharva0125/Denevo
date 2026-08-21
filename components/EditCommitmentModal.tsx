'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Commitment } from '@/types/commitment';
import { X, Calendar, Clock, User, Edit3, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commitment: Commitment | null;
}

export default function EditCommitmentModal({ isOpen, onClose, onSuccess, commitment }: Props) {
  const [person, setPerson] = useState('');
  const [action, setAction] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (commitment) {
      setPerson(commitment.person);
      setAction(commitment.action);
      setDueDate(commitment.due_date);
      setDueTime(commitment.due_time ? commitment.due_time.slice(0, 5) : '');
      setPriority(commitment.priority);
      setErrorMsg('');
    }
  }, [commitment]);

  if (!isOpen || !commitment) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase
      .from('commitments')
      .update({
        person,
        action,
        due_date: dueDate,
        due_time: dueTime ? (dueTime.length === 5 ? `${dueTime}:00` : dueTime) : null,
        priority,
      })
      .eq('id', commitment.id);

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0e1322]/95 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_0_35px_rgba(147,51,234,0.3)] max-h-[90vh] overflow-y-auto text-gray-100 animate-in slide-in-from-bottom duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Edit Commitment</h3>
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

        <form onSubmit={handleUpdate} className="mt-4 space-y-3.5">
          {/* Person */}
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
                className="w-full pl-9 pr-3 py-2.5 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Promise Action
            </label>
            <textarea
              required
              rows={2}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 resize-none transition"
            />
          </div>

          {/* Date & Time */}
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

          {/* Priority */}
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

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-transparent border border-purple-500/30 text-gray-300 hover:text-white text-xs font-semibold hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.35)] border border-purple-400/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}