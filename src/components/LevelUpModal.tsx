import { useEffect } from 'react';
import { titleFor } from '../services/storage';

interface LevelUpModalProps {
  level: number | null;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  useEffect(() => {
    if (level === null) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [level, onClose]);

  if (level === null) return null;

  const currentTitle = titleFor(level);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer animate-in fade-in duration-300"
    >
      {/* Background Rotating Conic Rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[180vmax] h-[180vmax] bg-[repeating-conic-gradient(from_0deg,rgba(0,240,255,0.18)_0deg_3deg,transparent_3deg_14deg)] animate-[spin_16s_linear_infinite] opacity-60" />
      </div>

      {/* Center Awakening HUD */}
      <div className="relative text-center z-10 max-w-lg px-6 py-8">
        {/* Horizontal Laser Line */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_24px_#00f0ff]" />

        <div className="font-mono text-xs sm:text-sm tracking-[0.4em] text-cyan-300 uppercase mb-2 animate-pulse">
          SYSTEM NOTIFICATION
        </div>

        <h2 className="font-head font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-widest bg-gradient-to-b from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.9)] leading-none select-none">
          LEVEL UP!
        </h2>

        <div className="font-head text-lg sm:text-2xl tracking-[0.25em] text-white mt-4 drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]">
          CẤP ĐỘ <span className="text-cyan-300 font-bold">{level}</span> ĐÃ ĐẠT ĐƯỢC
        </div>

        <div className="font-mono text-sm sm:text-base tracking-widest text-amber-300 uppercase mt-3 px-4 py-1.5 rounded-full inline-block bg-amber-500/10 border border-amber-400/40 shadow-[0_0_15px_rgba(255,209,102,0.3)]">
          ★ {currentTitle} ★
        </div>
      </div>
    </div>
  );
}
