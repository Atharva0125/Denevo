'use client';

import { Trash2, AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  person: string;
  loading?: boolean;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, person, loading }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-[#0e1322]/95 border border-red-500/30 rounded-3xl p-5 shadow-[0_0_35px_rgba(239,68,68,0.25)] text-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Warning Icon */}
        <div className="w-11 h-11 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto mb-3 shadow-inner">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-white">Delete Commitment?</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Are you sure you want to remove the commitment for <span className="text-cyan-300 font-semibold">{person}</span>?
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-transparent border border-purple-500/30 text-gray-300 hover:text-white text-xs font-semibold hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.35)] border border-red-400/30 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}