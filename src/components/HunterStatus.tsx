import { useState } from 'react';
import { RefreshCw, Edit3, Check } from 'lucide-react';
import { HunterState } from '../types/hunter';
import { EXP_PER_LEVEL, titleFor, nextTitleFor } from '../services/storage';

interface HunterStatusProps {
  state: HunterState;
  onUpdatePlayerName: (name: string) => void;
  onManualResetDay: () => void;
}

export function HunterStatus({ state, onUpdatePlayerName, onManualResetDay }: HunterStatusProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(state.playerName);

  const expPct = Math.min(100, Math.max(0, Math.round((state.exp / EXP_PER_LEVEL) * 100)));
  const expLeft = EXP_PER_LEVEL - state.exp;
  const currentTitle = titleFor(state.level);
  const nextTitle = nextTitleFor(state.level);

  const circleRadius = 68;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - expPct / 100);

  const handleSaveName = () => {
    const trimmed = nameVal.trim();
    if (trimmed) {
      onUpdatePlayerName(trimmed);
    } else {
      setNameVal(state.playerName);
    }
    setIsEditingName(false);
  };

  const doneDaily = state.dailyQuests.filter(q => q.completed).length;
  const totalDaily = state.dailyQuests.length;
  const activeEpic = state.epicQuests.filter(q => !q.completed).length;
  const doneEpic = state.epicQuests.filter(q => q.completed).length;

  return (
    <section className="hud-panel p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 text-xs font-bold">[01]</span>
          <h2 className="font-head text-xs sm:text-sm font-bold tracking-widest text-cyan-200 uppercase">
            BẢNG TRẠNG THÁI THỢ SĂN // HUNTER STATUS
          </h2>
        </div>
        <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-cyan-500/40 via-cyan-500/10 to-transparent mx-4" />
        <button
          onClick={onManualResetDay}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-xs font-head tracking-wider uppercase transition-all"
          title="Bỏ tích toàn bộ nhiệm vụ hàng ngày để bắt đầu lại chu kỳ"
        >
          <RefreshCw className="w-3 h-3" />
          <span>RESET NGÀY MỚI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[190px_1fr] gap-6 items-center">
        {/* Level Circular Ring */}
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto drop-shadow-[0_0_20px_rgba(0,240,255,0.35)] shrink-0">
          <svg viewBox="0 0 170 170" className="w-full h-full">
            <defs>
              <linearGradient id="gradRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0077ff" />
                <stop offset="55%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#b8ffff" />
              </linearGradient>
            </defs>
            <circle cx="85" cy="85" r="79" fill="none" stroke="rgba(0,240,255,0.22)" strokeWidth="1" strokeDasharray="3 7" />
            <circle cx="85" cy="85" r="68" fill="none" stroke="rgba(0,240,255,0.12)" strokeWidth="9" />
            <circle
              cx="85"
              cy="85"
              r="68"
              fill="none"
              stroke="url(#gradRing)"
              strokeWidth="9"
              strokeLinecap="round"
              transform="rotate(-90 85 85)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="font-head text-[9px] tracking-[0.3em] text-slate-400 uppercase">
              LEVEL
            </span>
            <span className="font-head font-extrabold text-4xl sm:text-5xl text-white drop-shadow-[0_0_18px_rgba(0,240,255,0.9)] leading-none my-1">
              {state.level}
            </span>
            <span className="font-mono text-[11px] text-cyan-300 font-semibold">
              {expPct}% EXP
            </span>
          </div>
        </div>

        {/* Player Profile & Experience Bar */}
        <div className="flex flex-col gap-3.5 min-w-0">
          {/* Name & Title */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameVal}
                  maxLength={28}
                  onChange={(e) => setNameVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="px-3 py-1 text-lg font-head font-bold bg-cyan-950/40 border border-cyan-400 rounded text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-400/50"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                <h3 className="font-head text-xl sm:text-2xl font-bold tracking-wide text-white hover:text-cyan-200 transition-colors">
                  {state.playerName}
                </h3>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-all" />
              </div>
            )}

            <div className="px-3 py-1 rounded bg-gradient-to-r from-purple-900/40 to-cyan-950/40 border border-purple-500/40 text-purple-200 font-head text-xs tracking-wider font-semibold shadow-[0_0_12px_rgba(123,92,255,0.25)]">
              {currentTitle}
            </div>
          </div>

          {/* EXP Progress Track */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-head font-semibold text-cyan-400 tracking-widest text-[11px]">
                EXPERIENCE
              </span>
              <span className="text-white font-bold">
                {state.exp} / {EXP_PER_LEVEL} EXP
              </span>
              <span className="text-cyan-300 font-bold ml-auto pl-2">{expPct}%</span>
            </div>

            <div className="h-4 rounded bg-black/60 border border-cyan-500/30 overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-200 transition-all duration-500 relative"
                style={{ width: `${expPct}%` }}
              >
                <div className="absolute inset-0 exp-sheen opacity-40" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-0.5">
              <span>
                TỔNG EXP: <b className="text-cyan-300">{state.totalExp}</b>
              </span>
              <span>
                CẦN <b className="text-amber-300">{expLeft}</b> EXP ĐỂ LÊN CẤP
              </span>
              <span className="hidden sm:inline">
                DANH HIỆU TIẾP: <b className="text-purple-300">{nextTitle}</b>
              </span>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
            <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-head text-slate-400 uppercase tracking-wider block">
                Nhiệm Vụ Ngày
              </span>
              <span className="text-sm font-mono font-bold text-cyan-300">
                {doneDaily}/{totalDaily}
              </span>
            </div>

            <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-head text-slate-400 uppercase tracking-wider block">
                Mục Tiêu Chạy
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {activeEpic}
              </span>
            </div>

            <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-head text-slate-400 uppercase tracking-wider block">
                Đã Hoàn Thành
              </span>
              <span className="text-sm font-mono font-bold text-emerald-300">
                {doneEpic}
              </span>
            </div>

            <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-head text-slate-400 uppercase tracking-wider block">
                Chuỗi Kỷ Luật
              </span>
              <span className="text-sm font-mono font-bold text-purple-300">
                {state.streak} ngày
              </span>
            </div>

            <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-head text-slate-400 uppercase tracking-wider block">
                Nhật Ký
              </span>
              <span className="text-sm font-mono font-bold text-slate-200">
                {state.studyLogs.length}
              </span>
            </div>

            <div className="p-2 rounded bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-head text-slate-400 uppercase tracking-wider block">
                Cấp / Tổng EXP
              </span>
              <span className="text-sm font-mono font-bold text-amber-300">
                LV.{state.level}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
