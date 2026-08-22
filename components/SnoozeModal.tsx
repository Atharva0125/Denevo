'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Commitment } from '@/types/commitment';
import { X, Moon, Clock, Calendar, ChevronRight, Loader2, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commitment: Commitment | null;
}

export default function SnoozeModal({ isOpen, onClose, onSuccess, commitment }: Props) {
  const [loading, setLoading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('10:00');

  if (!isOpen || !commitment) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isFutureOrSnoozed = commitment.due_date > todayStr;

  const handleUnsnooze = async () => {
    setLoading(true);
    const now = new Date();
    const currentFormattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    const { error } = await supabase
      .from('commitments')
      .update({
        due_date: todayStr,
        due_time: currentFormattedTime,
        status: 'pending',
      })
      .eq('id', commitment.id);

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    }
  };

  const handleSnoozePreset = async (type: 'later_today' | 'tomorrow' | '3_days' | 'next_week') => {
    setLoading(true);
    const now = new Date();
    let newDate = new Date();
    let newTime = commitment.due_time || '10:00:00';

    if (type === 'later_today') {
      newDate = now;
      const futureHours = (now.getHours() + 3) % 24;
      newTime = `${String(futureHours).padStart(2, '0')}:00:00`;
    } else if (type === 'tomorrow') {
      newDate.setDate(now.getDate() + 1);
      newTime = '09:00:00';
    } else if (type === '3_days') {
      newDate.setDate(now.getDate() + 3);
      newTime = '09:00:00';
    } else if (type === 'next_week') {
      newDate.setDate(now.getDate() + 7);
      newTime = '09:00:00';
    }

    const formattedDate = newDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('commitments')
      .update({
        due_date: formattedDate,
        due_time: newTime,
        status: 'pending',
      })
      .eq('id', commitment.id);

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    }
  };

  const handleCustomSnooze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;
    setLoading(true);

    const formattedTime = customTime ? (customTime.length === 5 ? `${customTime}:00` : customTime) : null;

    const { error } = await supabase
      .from('commitments')
      .update({
        due_date: customDate,
        due_time: formattedTime,
        status: 'pending',
      })
      .eq('id', commitment.id);

    setLoading(false);
    if (!error) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#0e1322]/95 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_35px_rgba(147,51,234,0.25)] text-gray-100 animate-in slide-in-from-bottom duration-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Snooze Settings</h3>
              <p className="text-[10px] text-gray-400">Manage timing for {commitment.person}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showCustom ? (
          <div className="space-y-2">
            {/* Quick Unsnooze Button */}
            {isFutureOrSnoozed && (
              <button
                onClick={handleUnsnooze}
                disabled={loading}
                className="w-full p-3 rounded-2xl bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/40 flex items-center justify-between transition text-xs font-semibold text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Unsnooze (Reset to Today)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            <button
              onClick={() => handleSnoozePreset('later_today')}
              disabled={loading}
              className="w-full p-3 rounded-2xl bg-[#090d16] hover:bg-purple-950/30 border border-purple-500/20 flex items-center justify-between transition text-xs font-medium text-gray-200"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Later today (+3 hours)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>

            <button
              onClick={() => handleSnoozePreset('tomorrow')}
              disabled={loading}
              className="w-full p-3 rounded-2xl bg-[#090d16] hover:bg-purple-950/30 border border-purple-500/20 flex items-center justify-between transition text-xs font-medium text-gray-200"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Tomorrow morning (9:00 AM)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>

            <button
              onClick={() => handleSnoozePreset('3_days')}
              disabled={loading}
              className="w-full p-3 rounded-2xl bg-[#090d16] hover:bg-purple-950/30 border border-purple-500/20 flex items-center justify-between transition text-xs font-medium text-gray-200"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>In 3 days</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>

            <button
              onClick={() => handleSnoozePreset('next_week')}
              disabled={loading}
              className="w-full p-3 rounded-2xl bg-[#090d16] hover:bg-purple-950/30 border border-purple-500/20 flex items-center justify-between transition text-xs font-medium text-gray-200"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Next week</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>

            <button
              onClick={() => setShowCustom(true)}
              className="w-full py-2 text-center text-xs font-semibold text-purple-300 hover:text-purple-200 transition"
            >
              Custom date & time →
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSnooze} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                New Date
              </label>
              <input
                type="date"
                required
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                New Time
              </label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#090d16] border border-purple-500/20 rounded-xl text-xs text-white outline-none focus:border-purple-400 [color-scheme:dark]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="flex-1 py-2.5 rounded-xl border border-purple-500/30 text-xs font-semibold text-gray-300 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.35)]"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Set Snooze'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}