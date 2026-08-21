'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Commitment } from '@/types/commitment';
import AddCommitmentModal from '@/components/AddCommitmentModal';
import EditCommitmentModal from '@/components/EditCommitmentModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import FollowUpModal from '../../components/FollowUpModal';
import { 
  AlertCircle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Check, 
  LogOut, 
  MessageSquare, 
  Sparkles, 
  Orbit,
  Pencil,
  Trash2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
  const [deletingCommitment, setDeletingCommitment] = useState<Commitment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCommitments = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('commitments')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (!error && data) {
      setCommitments(data as Commitment[]);
    }
  }, []);

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        await fetchCommitments(session.user.id);
        setLoading(false);
      }
    };
    checkSessionAndFetch();
  }, [router, fetchCommitments]);

  const toggleStatus = async (item: Commitment) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    const { error } = await supabase
      .from('commitments')
      .update({ status: newStatus })
      .eq('id', item.id);

    if (!error && user) {
      fetchCommitments(user.id);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCommitment) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from('commitments')
      .delete()
      .eq('id', deletingCommitment.id);

    setIsDeleting(false);

    if (!error && user) {
      setDeletingCommitment(null);
      fetchCommitments(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen galaxy-bg stars-overlay text-gray-300">
        <Orbit className="w-8 h-8 text-purple-400 animate-spin mb-2" />
        <span className="text-xs font-medium tracking-wide">Syncing Starlight...</span>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = commitments.filter((c) => c.status !== 'completed' && c.due_date < todayStr).length;
  const dueTodayCount = commitments.filter((c) => c.status !== 'completed' && c.due_date === todayStr).length;
  const upcomingCount = commitments.filter((c) => c.status !== 'completed' && c.due_date > todayStr).length;
  const completedCount = commitments.filter((c) => c.status === 'completed').length;

  const displayName = user?.user_metadata?.full_name || 'Cosmic Traveler';

  return (
    <div className="flex-1 flex flex-col justify-between galaxy-bg stars-overlay min-h-screen text-gray-100 relative">
      {/* Top Header */}
      <header className="px-5 pt-6 pb-4 glass-panel border-b border-purple-500/20 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Orbit className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-purple-300/80 block font-semibold uppercase tracking-wider">Galaxy Command</span>
            <h1 className="text-sm font-extrabold text-white leading-tight flex items-center gap-1.5">
              {displayName}
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            </h1>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-purple-300 transition rounded-xl hover:bg-white/5"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Action Feed */}
      <main className="p-5 flex-1 space-y-4 overflow-y-auto z-10">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3.5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition">
            <div className="flex justify-between items-center text-red-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Overdue</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-black text-white mt-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">{overdueCount}</p>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-purple-500/30 hover:border-purple-500/60 transition shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <div className="flex justify-between items-center text-purple-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Due Today</span>
              <Clock className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <p className="text-2xl font-black text-purple-200 mt-1 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{dueTodayCount}</p>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition">
            <div className="flex justify-between items-center text-cyan-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Upcoming</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-black text-white mt-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{upcomingCount}</p>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Fulfilled</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-black text-white mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">{completedCount}</p>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300/70">All Commitments</h2>
          <span className="text-[11px] text-gray-400 bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            {commitments.length} logged
          </span>
        </div>

        {/* Commitment Items */}
        {commitments.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-purple-500/30">
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-gray-200">No promises floating in your orbit</p>
            <p className="text-[11px] text-gray-400 mt-1">Tap below to log your next commitment with AI.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {commitments.map((item) => {
              const isDone = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  className={`glass-panel p-4 rounded-2xl transition duration-200 flex flex-col gap-2.5 ${
                    isDone
                      ? 'opacity-40 border-gray-700/40 bg-gray-900/40'
                      : 'hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center transition flex-shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-black font-bold'
                          : 'border-purple-400/40 bg-purple-950/30 hover:border-purple-400'
                      }`}
                      title={isDone ? 'Mark Pending' : 'Mark Complete'}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-cyan-300 truncate">{item.person}</span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Priority Pill */}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            item.priority === 'high' ? 'bg-red-950/50 text-red-400 border-red-500/30' :
                            item.priority === 'medium' ? 'bg-purple-950/50 text-purple-300 border-purple-500/30' :
                            'bg-gray-800 text-gray-400 border-gray-700'
                          }`}>
                            {item.priority}
                          </span>

                          {/* Edit Button */}
                          <button
                            onClick={() => setEditingCommitment(item)}
                            className="p-1 text-gray-400 hover:text-purple-300 rounded-lg hover:bg-white/5 transition"
                            title="Edit Commitment"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>

                          {/* Delete Button (Opens In-App Modal) */}
                          <button
                            onClick={() => setDeletingCommitment(item)}
                            className="p-1 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition"
                            title="Delete Commitment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'line-through text-gray-500' : 'text-gray-200 font-medium'}`}>
                        {item.action}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-500/10">
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-purple-400" /> {item.due_date}
                          </span>
                          {item.due_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" /> {item.due_time.slice(0, 5)}
                            </span>
                          )}
                        </div>

                        {!isDone && (
                          <button
                            onClick={() => setSelectedCommitment(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-900/40 hover:bg-purple-800/60 px-2.5 py-1 rounded-xl border border-purple-500/30 transition shadow-sm"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Follow up</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Add Action Button Bar */}
      <footer className="p-4 glass-panel border-t border-purple-500/20 sticky bottom-0 z-30">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.45)] border border-purple-400/30 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add My Commitment</span>
        </button>
      </footer>

      {/* Modals */}
      {user && (
        <>
          <AddCommitmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => fetchCommitments(user.id)}
            userId={user.id}
          />
          
          <EditCommitmentModal
            isOpen={!!editingCommitment}
            onClose={() => setEditingCommitment(null)}
            onSuccess={() => fetchCommitments(user.id)}
            commitment={editingCommitment}
          />

          <DeleteConfirmModal
            isOpen={!!deletingCommitment}
            onClose={() => setDeletingCommitment(null)}
            onConfirm={confirmDelete}
            person={deletingCommitment?.person || ''}
            loading={isDeleting}
          />

          <FollowUpModal
            isOpen={!!selectedCommitment}
            onClose={() => setSelectedCommitment(null)}
            commitment={selectedCommitment}
          />
        </>
      )}
    </div>
  );
}