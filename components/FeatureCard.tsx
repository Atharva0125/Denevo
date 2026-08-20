import { Brain, Bell, Send, LayoutDashboard } from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-5 h-5 text-purple-600" />,
    title: 'AI Promise Detection',
    description: 'Paste chats or type naturally. Denevo extracts commitments and follow-up deadlines automatically.',
  },
  {
    icon: <Bell className="w-5 h-5 text-purple-600" />,
    title: 'Smart Reminders',
    description: 'Receive proactive alerts at the exact time promises require action.',
  },
  {
    icon: <Send className="w-5 h-5 text-purple-600" />,
    title: 'AI Follow-up Generator',
    description: 'Generate polite, contextual follow-up messages in a single tap.',
  },
  {
    icon: <LayoutDashboard className="w-5 h-5 text-purple-600" />,
    title: 'Follow-Through Feed',
    description: 'Keep track of overdue, today, and upcoming commitments with clarity.',
  },
];

export default function FeatureCard() {
  return (
    <section className="py-6 px-6 space-y-3.5 mb-8">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Core Features</h2>
      <div className="grid grid-cols-1 gap-3">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{feature.title}</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}