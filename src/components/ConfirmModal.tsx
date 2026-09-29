import { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  body: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  body,
  confirmText = 'XÁC NHẬN',
  cancelText = 'HỦY BỎ',
  isDanger = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md hud-panel p-5 sm:p-6 text-slate-100 border shadow-2xl ${
          isDanger
            ? 'border-red-500/50 shadow-red-950/50'
            : 'border-cyan-500/40 shadow-cyan-950/50'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-cyan-500/20">
          {isDanger ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          )}
          <h3
            className={`font-head text-sm sm:text-base font-bold tracking-wider uppercase ${
              isDanger ? 'text-red-400' : 'text-cyan-300'
            }`}
          >
            {title}
          </h3>
        </div>

        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-6">
          {body}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-head tracking-wider uppercase transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-xs font-head tracking-wider uppercase font-bold transition-all ${
              isDanger
                ? 'bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/60 shadow-[0_0_12px_rgba(255,59,107,0.3)]'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
