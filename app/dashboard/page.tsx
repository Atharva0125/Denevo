'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Commitment } from '@/types/commitment';
import AddCommitmentModal from '@/components/AddCommitmentModal';
import { AlertCircle, Clock, Calendar, CheckCircle2, Plus, Check, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs font-medium text-gray-400">
        Loading commitments...
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = commitments.filter((c) => c.status !== 'completed' && c.due_date < todayStr).length;
  const dueTodayCount = commitments.filter((c) => c.status !== 'completed' && c.due_date === todayStr).length;
  const upcomingCount = commitments.filter((c) => c.status !== 'completed' && c.due_date > todayStr).length;
  const completedCount = commitments.filter((c) => c.status === 'completed').length;

  const displayName = user?.user_metadata?.full_name || 'Atharva';

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#FAFAFA] min-h-screen">
      {/* Top Header */}
      <header className="px-5 pt-5 pb-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            D
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium uppercase">Dashboard</span>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">{displayName}</h1>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-gray-700 transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Feed Content */}
      <main className="p-5 flex-1 space-y-4 overflow-y-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center text-red-500">
              <span className="text-[10px] font-bold uppercase">Overdue</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overdueCount}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center text-purple-600">
              <span className="text-[10px] font-bold uppercase">Due Today</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{dueTodayCount}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center text-blue-500">
              <span className="text-[10px] font-bold uppercase">Upcoming</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingCount}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center text-green-600">
              <span className="text-[10px] font-bold uppercase">Done</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{completedCount}</p>
          </div>
        </div>

        {/* Action Feed Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">All Commitments</h2>
          <span className="text-[11px] text-gray-400">{commitments.length} total</span>
        </div>

        {/* Commitment Items List */}
        {commitments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-xs font-semibold text-gray-700">No commitments found</p>
            <p className="text-[11px] text-gray-400 mt-1">Tap the plus button below to add your first promise.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {commitments.map((item) => {
              const isDone = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  className={`bg-white p-3.5 rounded-2xl border transition shadow-sm flex items-start gap-3 ${
                    isDone ? 'border-gray-100 opacity-60 bg-gray-50/60' : 'border-purple-100'
                  }`}
                >
                  <button
                    onClick={() => toggleStatus(item)}
                    className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center transition flex-shrink-0 ${
                      isDone
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 hover:border-purple-600'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-purple-700 truncate">{item.person}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        item.priority === 'high' ? 'bg-red-50 text-red-600' :
                        item.priority === 'medium' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    <p className={`text-xs mt-0.5 ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.action}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.due_date}
                      </span>
                      {item.due_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.due_time.slice(0, 5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Add Action Button Bar */}
      <footer className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Commitment</span>
        </button>
      </footer>

      {/* Modal / Bottom Sheet */}
      {user && (
        <AddCommitmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchCommitments(user.id)}
          userId={user.id}
        />
      )}
    </div>
  );
}