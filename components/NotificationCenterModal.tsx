'use client';

import { Commitment } from '@/types/commitment';
import { X, Bell, Clock, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commitments: Commitment[];
  onSelectFollowUp: (item: Commitment) => void;
}

export default function NotificationCenterModal({ isOpen, onClose, commitments, onSelectFollowUp }: Props) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const overdue = commitments.filter((c) => c.status !== 'completed' && c.due_date < todayStr);
  const dueToday = commitments.filter((c) => c.status !== 'completed' && c.due_date === todayStr);
  const dueTomorrow = commitments.filter((c) => c.status !== 'completed' && c.due_date === tomorrowStr);

  const totalReminders = overdue.length + dueToday.length + dueTomorrow.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#0e1322]/95 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_35px_rgba(147,51,234,0.25)] text-gray-100 animate-in slide-in-from-bottom duration-200 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Notifications & Reminders</h3>
              <p className="text-[10px] text-gray-400">{totalReminders} active alert{totalReminders === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {totalReminders === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-emerald-300">✓ You're all caught up.</p>
            <p className="text-[10px] text-gray-500">No imminent deadlines or overdue promises.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Overdue */}
            {overdue.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    <span className="text-xs font-bold text-red-300">{item.person}</span>
                    <span className="text-[9px] text-red-400 font-medium font-mono">Overdue</span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate mt-0.5">{item.action}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onSelectFollowUp(item);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-red-900/50 hover:bg-red-800 text-red-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 border border-red-500/40"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Follow Up</span>
                </button>
              </div>
            ))}

            {/* Due Today */}
            {dueToday.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-bold text-purple-200">{item.person}</span>
                    <span className="text-[9px] text-purple-400 font-medium">Due Today</span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate mt-0.5">{item.action}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onSelectFollowUp(item);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 border border-purple-500/40"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Follow Up</span>
                </button>
              </div>
            ))}

            {/* Due Tomorrow */}
            {dueTomorrow.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-200">{item.person}</span>
                    <span className="text-[9px] text-cyan-400 font-medium">Due Tomorrow</span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate mt-0.5">{item.action}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onSelectFollowUp(item);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-indigo-900/50 hover:bg-indigo-800 text-cyan-200 text-[10px] font-semibold flex items-center gap-1 shrink-0 border border-indigo-500/40"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Follow Up</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}