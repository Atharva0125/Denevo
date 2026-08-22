'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Commitment } from '@/types/commitment';
import AddCommitmentModal from '@/components/AddCommitmentModal';
import EditCommitmentModal from '@/components/EditCommitmentModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import FollowUpModal from '@/components/FollowUpModal';
import SnoozeModal from '@/components/SnoozeModal';
import PrioritySelectorModal from '@/components/PrioritySelectorModal';
import NotificationCenterModal from '@/components/NotificationCenterModal';
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
  Trash2, 
  CheckCircle, 
  Bell, 
  Moon,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
  const [snoozingCommitment, setSnoozingCommitment] = useState<Commitment | null>(null);
  const [prioritizingCommitment, setPrioritizingCommitment] = useState<Commitment | null>(null);
  const [deletingCommitment, setDeletingCommitment] = useState<Commitment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live greeting rotation
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [currentTimeGreeting, setCurrentTimeGreeting] = useState('');

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

  // Extract user first name
  const rawFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Executive';
  const firstName = rawFullName.trim().split(' ')[0];

  // Dynamic time greeting
  const calculateGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Good morning, ${firstName}`;
    if (hour >= 12 && hour < 17) return `Good afternoon, ${firstName}`;
    if (hour >= 17 && hour < 22) return `Good evening, ${firstName}`;
    return `Good night, ${firstName}`;
  }, [firstName]);

  // 5-second live rotation
  useEffect(() => {
    setCurrentTimeGreeting(calculateGreeting());
    const timer = setInterval(() => {
      setCurrentTimeGreeting(calculateGreeting());
      setGreetingIndex((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, [calculateGreeting]);

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

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const overdueList = commitments.filter((c) => c.status !== 'completed' && c.due_date < todayStr);
  const dueTodayList = commitments.filter((c) => c.status !== 'completed' && c.due_date === todayStr);
  const dueTomorrowList = commitments.filter((c) => c.status !== 'completed' && c.due_date === tomorrowStr);
  const upcomingCount = commitments.filter((c) => c.status !== 'completed' && c.due_date > todayStr).length;
  const completedCount = commitments.filter((c) => c.status === 'completed').length;

  const totalNotifications = overdueList.length + dueTodayList.length + dueTomorrowList.length;

  // Single Top Focus Item: Strict Executive Priority Ladder
  // Ladder: Overdue(High) -> Today(High) -> Overdue(Med) -> Today(Med) -> Overdue(Low/None) -> Today(Low/None)
  const topFocusItem = useMemo(() => {
    const active = commitments.filter((c) => c.status !== 'completed');
    const sorted = [...active].sort((a, b) => {
      const aOverdue = a.due_date < todayStr ? 1 : 0;
      const bOverdue = b.due_date < todayStr ? 1 : 0;

      const aToday = a.due_date === todayStr ? 1 : 0;
      const bToday = b.due_date === todayStr ? 1 : 0;

      // Priority weights
      const weights: Record<string, number> = { high: 4, medium: 3, low: 2, none: 1 };
      const aWeight = weights[a.priority || 'none'] || 1;
      const bWeight = weights[b.priority || 'none'] || 1;

      // 1. Compare High priority items first (Overdue High > Today High)
      if (aWeight === 4 || bWeight === 4) {
        if (aWeight !== bWeight) return bWeight - aWeight;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        if (aToday !== bToday) return bToday - aToday;
      }

      // 2. Compare Overdue vs Today for other tiers
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      if (aToday !== bToday) return bToday - aToday;

      // 3. Compare remaining priority weights
      if (aWeight !== bWeight) return bWeight - aWeight;

      // 4. Earliest time
      return (a.due_time || '23:59').localeCompare(b.due_time || '23:59');
    });
    return sorted[0] || null;
  }, [commitments, todayStr]);

  // Helper renderer for priority badge
  const renderPriorityBadge = (item: Commitment) => {
    const priority = item.priority || 'none';
    let styles = 'bg-gray-800/80 text-gray-400 border-gray-700';
    let label = 'No Priority';

    if (priority === 'high') {
      styles = 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
      label = 'High';
    } else if (priority === 'medium') {
      styles = 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      label = 'Medium';
    } else if (priority === 'low') {
      styles = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      label = 'Low';
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setPrioritizingCommitment(item);
        }}
        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border cursor-pointer active:scale-95 transition flex items-center gap-1 ${styles}`}
        title="Tap to change priority"
      >
        <span>{label}</span>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-300">
        <Orbit className="w-8 h-8 text-purple-400 animate-spin mb-2" />
        <span className="text-xs font-medium tracking-wide">✦ Preparing your day...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-gray-100 relative">
      {/* Top Cosmic Header */}
      <header className="px-5 pt-4 pb-3.5 bg-[#0e1322]/90 border-b border-purple-500/20 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Orbit className="w-5 h-5" />
          </div>
          <div className="overflow-hidden flex items-center">
            <h1 className="text-sm font-extrabold text-white leading-tight flex items-center gap-1.5 transition-all duration-500 ease-in-out">
              {greetingIndex === 0 ? (
                <>
                  <span>Hi {firstName}, welcome</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                </>
              ) : (
                <>
                  <span>{currentTimeGreeting}</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                </>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="p-2 text-gray-400 hover:text-purple-300 transition rounded-xl hover:bg-white/5 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-purple-300 transition rounded-xl hover:bg-white/5"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Dedicated Scroll Container */}
      <main className="p-5 flex-1 overflow-y-auto space-y-4 no-scrollbar smooth-scroll">
        
        {/* ✦ STREAMLINED "TODAY'S FOCUS" CARD */}
        <section className="p-4 rounded-3xl bg-gradient-to-br from-[#1b122e] via-[#10152b] to-[#0c1020] border border-purple-500/35 shadow-[0_0_25px_rgba(147,51,234,0.18)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>✦ Today's Focus</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {commitments.length === 0 ? (
            <div className="space-y-2 py-1">
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                ✦ Your Denevo is ready. Add your first commitment and let Denevo remember it for you.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-300 hover:text-white transition"
              >
                <span>Add first commitment</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : topFocusItem ? (
            <div className="space-y-2.5">
              {/* Executive Summary Line */}
              <p className="text-[11px] text-gray-300 leading-snug">
                {overdueList.length > 0 ? (
                  <>
                    You have <strong className="text-rose-400 font-bold">{overdueList.length} overdue</strong> commitment{overdueList.length === 1 ? '' : 's'} and <strong className="text-purple-300 font-bold">{dueTodayList.length}</strong> due today.
                  </>
                ) : dueTodayList.length > 0 ? (
                  <>
                    You have <strong className="text-purple-300 font-bold">{dueTodayList.length}</strong> commitment{dueTodayList.length === 1 ? '' : 's'} scheduled for today.
                  </>
                ) : (
                  <>
                    Next commitment coming up on <strong className="text-cyan-300 font-bold">{topFocusItem.due_date}</strong>.
                  </>
                )}
              </p>

              {/* In-Place Action Focus Card */}
              <div className={`p-3 rounded-2xl border space-y-2.5 ${
                topFocusItem.due_date < todayStr
                  ? 'bg-rose-950/40 border-rose-500/40'
                  : topFocusItem.due_date === todayStr
                  ? 'bg-purple-950/40 border-purple-500/40'
                  : 'bg-[#13192c] border-indigo-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      topFocusItem.due_date < todayStr ? 'bg-rose-400 animate-ping' : topFocusItem.due_date === todayStr ? 'bg-yellow-400' : 'bg-purple-400'
                    }`} />
                    <span className="text-xs font-bold text-white">{topFocusItem.person}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-mono">
                      {topFocusItem.due_date < todayStr ? 'Overdue' : topFocusItem.due_date === todayStr ? 'Due Today' : 'Upcoming'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {renderPriorityBadge(topFocusItem)}

                    <button
                      onClick={() => setSnoozingCommitment(topFocusItem)}
                      className="p-1 text-gray-400 hover:text-purple-300 rounded-lg hover:bg-white/5 transition"
                      title="Snooze"
                    >
                      <Moon className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-200 leading-snug font-medium">
                  {topFocusItem.action}
                </p>

                {/* Direct Action Execution Buttons */}
                <div className="pt-2 border-t border-purple-500/15 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCommitment(topFocusItem)}
                    className="flex-1 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-purple-500/30 transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Follow Up</span>
                  </button>

                  <button
                    onClick={() => toggleStatus(topFocusItem)}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Fulfill</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs text-emerald-300 font-bold block">✦ You're all caught up!</span>
                <span className="text-[10px] text-gray-400 block">No commitments requiring attention today.</span>
              </div>
            </div>
          )}
        </section>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3.5 rounded-2xl border border-red-500/20">
            <div className="flex justify-between items-center text-red-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Overdue</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{overdueList.length}</p>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-purple-500/30">
            <div className="flex justify-between items-center text-purple-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Due Today</span>
              <Clock className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <p className="text-2xl font-black text-purple-200 mt-1">{dueTodayList.length}</p>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/20">
            <div className="flex justify-between items-center text-cyan-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Upcoming</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{upcomingCount}</p>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/20">
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Fulfilled</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{completedCount}</p>
          </div>
        </div>

        {/* ALL COMMITMENTS SECTION */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300/70">All Commitments</h2>
            <span className="text-[11px] text-gray-400 bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              {commitments.length} logged
            </span>
          </div>

          {commitments.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-purple-500/30">
              <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-gray-200">No promises floating in your orbit</p>
              <p className="text-[11px] text-gray-400 mt-1">Tap below to log your next commitment with AI.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {commitments.map((item) => {
                const isDone = item.status === 'completed';
                const isSnoozedOrFuture = !isDone && item.due_date > todayStr;

                return (
                  <div
                    key={item.id}
                    className={`glass-panel p-4 rounded-2xl transition duration-150 flex flex-col gap-2.5 ${
                      isDone
                        ? 'opacity-40 border-gray-700/40 bg-gray-900/40'
                        : 'border-purple-500/25'
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
                            {/* Tap-to-Change Priority Badge */}
                            {!isDone && renderPriorityBadge(item)}

                            {/* Snooze / Unsnooze */}
                            {!isDone && (
                              <button
                                onClick={() => setSnoozingCommitment(item)}
                                className={`p-1 rounded-lg transition ${
                                  isSnoozedOrFuture
                                    ? 'text-amber-300 bg-amber-950/50 border border-amber-500/40'
                                    : 'text-gray-400 hover:text-purple-300 hover:bg-white/5'
                                }`}
                                title={isSnoozedOrFuture ? "Snoozed (Click to Unsnooze or Reschedule)" : "Snooze"}
                              >
                                <Moon className="w-3 h-3" />
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => setEditingCommitment(item)}
                              className="p-1 text-gray-400 hover:text-purple-300 rounded-lg hover:bg-white/5 transition"
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeletingCommitment(item)}
                              className="p-1 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition"
                              title="Delete"
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
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-900/40 hover:bg-purple-800/60 px-2.5 py-1 rounded-xl border border-purple-500/30 transition"
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
        </section>
      </main>

      {/* Floating Bottom Add Bar */}
      <footer className="p-4 bg-[#0e1322]/90 border-t border-purple-500/20 shrink-0 z-20">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 border border-purple-400/30 transition active:scale-[0.98]"
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

          <SnoozeModal
            isOpen={!!snoozingCommitment}
            onClose={() => setSnoozingCommitment(null)}
            onSuccess={() => fetchCommitments(user.id)}
            commitment={snoozingCommitment}
          />

          <PrioritySelectorModal
            isOpen={!!prioritizingCommitment}
            onClose={() => setPrioritizingCommitment(null)}
            onSuccess={() => fetchCommitments(user.id)}
            commitment={prioritizingCommitment}
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

          <NotificationCenterModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            commitments={commitments}
            onSelectFollowUp={(item) => setSelectedCommitment(item)}
          />
        </>
      )}
    </div>
  );
}