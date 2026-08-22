'use client';

import { X, Check } from 'lucide-react';
import { Commitment } from '@/types/commitment';
import { supabase } from '@/lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commitment: Commitment | null;
}

export default function PrioritySelectorModal({ isOpen, onClose, onSuccess, commitment }: Props) {
  if (!isOpen || !commitment) return null;

  const currentPriority = commitment.priority || 'none';

  const options: Array<{
    id: 'high' | 'medium' | 'low' | 'none';
    label: string;
    description: string;
    dotColor: string;
    borderActive: string;
    badgeStyle: string;
  }> = [
    {
      id: 'high',
      label: 'High Priority',
      description: 'Critical promise — elevates to top of focus',
      dotColor: 'bg-rose-500',
      borderActive: 'border-rose-500/60 bg-rose-950/40 text-rose-200',
      badgeStyle: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
    },
    {
      id: 'medium',
      label: 'Medium Priority',
      description: 'Important — complete after high priority items',
      dotColor: 'bg-purple-400',
      borderActive: 'border-purple-500/60 bg-purple-950/40 text-purple-200',
      badgeStyle: 'text-purple-300 bg-purple-950/60 border-purple-500/40',
    },
    {
      id: 'low',
      label: 'Low Priority',
      description: 'Can wait — handle when schedule permits',
      dotColor: 'bg-cyan-400',
      borderActive: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200',
      badgeStyle: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40',
    },
    {
      id: 'none',
      label: 'No Priority',
      description: 'Standard promise with baseline priority',
      dotColor: 'bg-gray-500',
      borderActive: 'border-gray-500/60 bg-gray-900/60 text-gray-200',
      badgeStyle: 'text-gray-400 bg-gray-800/60 border-gray-700',
    },
  ];

  const handleSelect = async (priority: 'none' | 'low' | 'medium' | 'high') => {
    onClose();
    await supabase
      .from('commitments')
      .update({ priority })
      .eq('id', commitment.id);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-[#0e1322]/98 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_35px_rgba(147,51,234,0.3)] text-gray-100 animate-in slide-in-from-bottom duration-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div>
            <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Set Importance</span>
            <h3 className="text-xs font-bold text-white leading-tight">Priority for {commitment.person}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Options */}
        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = currentPriority === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition ${
                  isSelected
                    ? opt.borderActive
                    : 'border-purple-500/15 bg-[#090d16] hover:bg-purple-950/20 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor} shrink-0`} />
                  <div>
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] text-gray-400 block leading-tight">{opt.description}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-purple-300 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}