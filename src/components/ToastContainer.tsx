import { ToastMessage } from '../types/hunter';

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((t) => {
        let borderCls = 'border-l-cyan-400 bg-gradient-to-r from-cyan-950/90 to-slate-900/95 text-cyan-100 border-cyan-500/30';
        if (t.type === 'success') {
          borderCls = 'border-l-emerald-400 bg-gradient-to-r from-emerald-950/90 to-slate-900/95 text-emerald-100 border-emerald-500/30';
        } else if (t.type === 'gold') {
          borderCls = 'border-l-amber-400 bg-gradient-to-r from-amber-950/90 to-slate-900/95 text-amber-100 border-amber-500/30';
        } else if (t.type === 'danger') {
          borderCls = 'border-l-red-500 bg-gradient-to-r from-red-950/90 to-slate-900/95 text-red-100 border-red-500/30';
        }

        return (
          <div
            key={t.id}
            className={`p-3 rounded border border-l-4 shadow-xl backdrop-blur-md font-mono text-xs leading-relaxed transition-all animate-in slide-in-from-right-4 fade-in duration-200 pointer-events-auto ${borderCls}`}
          >
            <div className="flex items-start gap-2">
              {t.icon && <span className="font-bold">{t.icon}</span>}
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: t.text }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
