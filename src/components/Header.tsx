import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Smartphone, Wifi, WifiOff, CloudOff } from 'lucide-react';
import { SyncConfig } from '../types/hunter';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  syncConfig: SyncConfig;
  isOnline: boolean;
  isSyncing: boolean;
  onOpenSyncModal: () => void;
  onManualReset: () => void;
}

export function Header({
  soundEnabled,
  onToggleSound,
  syncConfig,
  isOnline,
  isSyncing,
  onOpenSyncModal
}: HeaderProps) {
  const [clock, setClock] = useState({ time: '--:--:--', date: '--/--/----', midnight: '--:--:--' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const p = (n: number) => String(n).padStart(2, '0');
      const time = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
      const date = `${p(now.getDate())}/${p(now.getMonth() + 1)}/${now.getFullYear()}`;

      const mid = new Date(now);
      mid.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((mid.getTime() - now.getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      const midnight = `${p(h)}:${p(m)}:${p(s)}`;

      setClock({ time, date, midnight });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDisconnected = !isOnline || syncConfig.forceOffline;

  return (
    <header className="hud-topbar p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Sigil & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">
            <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
              <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" stroke="#00f0ff" strokeWidth="1.6" />
              <polygon points="24,10 36,17 36,31 24,38 12,31 12,17" stroke="#0077ff" strokeWidth="1.2" />
              <path d="M24 16 L31 28 H17 Z" fill="#00f0ff" opacity="0.85" />
              <circle cx="24" cy="24" r="20" stroke="rgba(0,240,255,0.28)" strokeWidth="0.8" strokeDasharray="2 5" />
            </svg>
          </div>

          <div>
            <h1 className="font-head text-base sm:text-xl font-bold tracking-widest bg-gradient-to-r from-white via-cyan-300 to-blue-400 bg-clip-text text-transparent leading-none">
              SOLO LEVELING SYSTEM
            </h1>
            <p className="text-[10px] sm:text-xs tracking-[0.25em] text-cyan-400/80 font-mono mt-0.5 uppercase">
              Study Status &amp; Quest Board
            </p>
          </div>
        </div>

        {/* Center: System Status & Clock */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-between md:justify-center border-t md:border-t-0 border-cyan-500/20 pt-2 md:pt-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDisconnected ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isDisconnected ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
            <span className="font-mono text-[11px] sm:text-xs text-slate-300 uppercase tracking-wider">
              {isDisconnected ? (
                <span className="text-amber-300 flex items-center gap-1 font-semibold">
                  {syncConfig.forceOffline ? <CloudOff className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  LOCAL MODE
                </span>
              ) : (
                <span className="text-emerald-300 flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> ONLINE SYSTEM
                </span>
              )}
            </span>
          </div>

          <div className="font-mono text-right text-xs leading-tight">
            <div className="text-cyan-300 font-bold">
              <span>{clock.time}</span> · <span className="text-slate-400 font-normal">{clock.date}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              RESET SAU: <span className="text-amber-300 font-bold">{clock.midnight}</span>
            </div>
          </div>
        </div>

        {/* Right: Sync & Audio Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
          {/* Sync device button */}
          <button
            onClick={onOpenSyncModal}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-head tracking-wider uppercase transition-all shadow-sm ${
              syncConfig.syncCode
                ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200 hover:bg-cyan-500/25 shadow-cyan-500/20'
                : 'bg-blue-600/15 border-blue-400/40 text-blue-200 hover:bg-blue-600/25'
            }`}
            title="Đồng bộ hóa với thiết bị khác qua mã số ngẫu nhiên"
          >
            <Smartphone className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-cyan-300' : ''}`} />
            <span className="hidden sm:inline">MÃ ĐỒNG BỘ:</span>
            <span className="font-mono font-bold text-cyan-300">
              {syncConfig.syncCode || 'TẠO MÃ'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded border border-slate-700 bg-slate-900/60 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 text-xs font-head tracking-wider uppercase transition-all flex items-center gap-1.5"
            title={soundEnabled ? 'Tắt âm thanh hệ thống' : 'Bật âm thanh hệ thống'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">BẬT</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">TẮT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
